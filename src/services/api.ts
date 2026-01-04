import {
  User,
  Quiz,
  Manual,
  Feedback,
  LoginCredentials,
  AuthResponse,
  QuizAttempt,
  AdminComment
} from '../types';
import { supabase } from '../lib/supabase';

class ApiService {
  async login(credentials: LoginCredentials & { role: 'trainee' | 'admin' }): Promise<AuthResponse> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Login failed');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile) {
      throw new Error('User profile not found');
    }

    if (profile.role !== credentials.role) {
      await supabase.auth.signOut();
      throw new Error(`Invalid credentials for ${credentials.role} role`);
    }

    const user: User = {
      id: profile.id,
      username: profile.username,
      email: authData.user.email!,
      fullName: profile.full_name,
      role: profile.role,
    };

    return {
      token: authData.session!.access_token,
      user,
    };
  }

  async signup(signupData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }): Promise<AuthResponse> {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', signupData.username)
      .maybeSingle();

    if (existingProfile) {
      throw new Error('Username already taken');
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new Error('This email is already registered. Please try logging in instead.');
      }
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Signup failed');
    }

    if (!authData.session) {
      throw new Error('Account created but unable to log in. Please try logging in.');
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: signupData.username,
        full_name: signupData.fullName,
        role: 'trainee',
      });

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {});

      if (profileError.message.includes('duplicate key')) {
        throw new Error('Username already taken');
      }
      throw new Error('Failed to create profile. Please try again.');
    }

    const user: User = {
      id: authData.user.id,
      username: signupData.username,
      email: signupData.email,
      fullName: signupData.fullName,
      role: 'trainee',
    };

    return {
      token: authData.session.access_token,
      user,
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<User> {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      throw new Error('Not authenticated');
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error || !profile) {
      throw new Error('User profile not found');
    }

    return {
      id: profile.id,
      username: profile.username,
      email: authUser.email!,
      fullName: profile.full_name,
      role: profile.role,
    };
  }

  async getQuizzes(): Promise<Quiz[]> {
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (quizzesError) {
      throw new Error(quizzesError.message);
    }

    const quizzesWithQuestions = await Promise.all(
      quizzes.map(async (quiz) => {
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select(`
            *,
            question_options (*)
          `)
          .eq('quiz_id', quiz.id)
          .order('order_index', { ascending: true });

        if (questionsError) {
          throw new Error(questionsError.message);
        }

        const formattedQuestions = questions.map((q) => ({
          id: q.id,
          questionText: q.question_text,
          options: (q.question_options || [])
            .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
            .map((opt: { id: string; option_text: string; is_correct: boolean }) => ({
              id: opt.id,
              questionId: q.id,
              optionText: opt.option_text,
              isCorrect: opt.is_correct,
            })),
          correctOptionId: (q.question_options || []).find((opt: { is_correct: boolean }) => opt.is_correct)?.id,
        }));

        return {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.time_limit,
          passingScore: quiz.passing_score,
          questions: formattedQuestions,
          createdAt: quiz.created_at,
          updatedAt: quiz.updated_at,
        };
      })
    );

    return quizzesWithQuestions;
  }

  async getQuizById(id: string): Promise<Quiz> {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (quizError || !quiz) {
      throw new Error('Quiz not found');
    }

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        *,
        question_options (*)
      `)
      .eq('quiz_id', id)
      .order('order_index', { ascending: true });

    if (questionsError) {
      throw new Error(questionsError.message);
    }

    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      questionText: q.question_text,
      options: (q.question_options || [])
        .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
        .map((opt: { id: string; option_text: string; is_correct: boolean }) => ({
          id: opt.id,
          questionId: q.id,
          optionText: opt.option_text,
          isCorrect: opt.is_correct,
        })),
      correctOptionId: (q.question_options || []).find((opt: { is_correct: boolean }) => opt.is_correct)?.id,
    }));

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.time_limit,
      passingScore: quiz.passing_score,
      questions: formattedQuestions,
      createdAt: quiz.created_at,
      updatedAt: quiz.updated_at,
    };
  }

  async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quiz> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: newQuiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: quiz.title,
        description: quiz.description,
        time_limit: quiz.timeLimit,
        passing_score: quiz.passingScore,
        created_by: user.id,
      })
      .select()
      .single();

    if (quizError) {
      throw new Error(quizError.message);
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];

      const { data: newQuestion, error: questionError } = await supabase
        .from('questions')
        .insert({
          quiz_id: newQuiz.id,
          question_text: question.questionText,
          order_index: i,
          points: 1,
        })
        .select()
        .single();

      if (questionError) {
        throw new Error(questionError.message);
      }

      const optionsToInsert = question.options.map((opt, idx) => ({
        question_id: newQuestion.id,
        option_text: opt.optionText,
        is_correct: opt.id === question.correctOptionId,
        order_index: idx,
      }));

      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(optionsToInsert);

      if (optionsError) {
        throw new Error(optionsError.message);
      }
    }

    return this.getQuizById(newQuiz.id);
  }

  async updateQuiz(id: string, quiz: Partial<Quiz>): Promise<Quiz> {
    const { error: quizError } = await supabase
      .from('quizzes')
      .update({
        title: quiz.title,
        description: quiz.description,
        time_limit: quiz.timeLimit,
        passing_score: quiz.passingScore,
      })
      .eq('id', id);

    if (quizError) {
      throw new Error(quizError.message);
    }

    if (quiz.questions) {
      const { error: deleteQuestionsError } = await supabase
        .from('questions')
        .delete()
        .eq('quiz_id', id);

      if (deleteQuestionsError) {
        throw new Error(deleteQuestionsError.message);
      }

      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];

        const { data: newQuestion, error: questionError } = await supabase
          .from('questions')
          .insert({
            quiz_id: id,
            question_text: question.questionText,
            order_index: i,
            points: 1,
          })
          .select()
          .single();

        if (questionError) {
          throw new Error(questionError.message);
        }

        const optionsToInsert = question.options.map((opt, idx) => ({
          question_id: newQuestion.id,
          option_text: opt.optionText,
          is_correct: opt.id === question.correctOptionId,
          order_index: idx,
        }));

        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(optionsToInsert);

        if (optionsError) {
          throw new Error(optionsError.message);
        }
      }
    }

    return this.getQuizById(id);
  }

  async deleteQuiz(id: string): Promise<void> {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async submitQuizAttempt(quizId: string, answers: { questionId: string; selectedOptionId: string }[]): Promise<QuizAttempt> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const quiz = await this.getQuizById(quizId);

    let totalScore = 0;
    let totalPoints = 0;
    const answerResults: { questionId: string; selectedOptionId: string; isCorrect: boolean }[] = [];

    for (const answer of answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (question) {
        totalPoints += 1;
        const selectedOption = question.options.find(opt => opt.id === answer.selectedOptionId);
        const isCorrect = selectedOption?.isCorrect || false;

        if (isCorrect) {
          totalScore += 1;
        }

        answerResults.push({
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect,
        });
      }
    }

    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        user_id: user.id,
        score: totalScore,
        total_points: totalPoints,
      })
      .select()
      .single();

    if (attemptError) {
      throw new Error(attemptError.message);
    }

    const answersToInsert = answerResults.map(ans => ({
      attempt_id: attempt.id,
      question_id: ans.questionId,
      selected_option_id: ans.selectedOptionId,
      is_correct: ans.isCorrect,
    }));

    const { error: answersError } = await supabase
      .from('attempt_answers')
      .insert(answersToInsert);

    if (answersError) {
      throw new Error(answersError.message);
    }

    return {
      id: attempt.id,
      quizId,
      userId: user.id,
      score: totalScore,
      totalPoints,
      completedAt: attempt.completed_at,
      answers: answerResults.map(ans => ({
        questionId: ans.questionId,
        selectedOptionId: ans.selectedOptionId,
        isCorrect: ans.isCorrect,
      })),
    };
  }

  async getQuizAttempts(userId?: string): Promise<QuizAttempt[]> {
    let query = supabase
      .from('quiz_attempts')
      .select('*')
      .order('completed_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data.map(attempt => ({
      id: attempt.id,
      quizId: attempt.quiz_id,
      userId: attempt.user_id,
      score: attempt.score,
      totalPoints: attempt.total_points,
      completedAt: attempt.completed_at,
      answers: [],
    }));
  }

  async uploadPDF(file: File, manualId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${manualId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('manuals')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('manuals')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  async deletePDF(pdfUrl: string): Promise<void> {
    const urlParts = pdfUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from('manuals')
      .remove([fileName]);

    if (error) {
      console.error('Failed to delete PDF:', error);
    }
  }

  async getManuals(): Promise<Manual[]> {
    const { data, error } = await supabase
      .from('manuals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(manual => ({
      id: manual.id,
      title: manual.title,
      category: manual.category,
      content: manual.content,
      tags: manual.tags || [],
      pdfUrl: manual.pdf_url,
      createdAt: manual.created_at,
      updatedAt: manual.updated_at,
    }));
  }

  async getManualById(id: string): Promise<Manual> {
    const { data, error } = await supabase
      .from('manuals')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Manual not found');
    }

    return {
      id: data.id,
      title: data.title,
      category: data.category,
      content: data.content,
      tags: data.tags || [],
      pdfUrl: data.pdf_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async createManual(manual: Omit<Manual, 'id' | 'createdAt' | 'updatedAt'>): Promise<Manual> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('manuals')
      .insert({
        title: manual.title,
        category: manual.category,
        content: manual.content,
        tags: manual.tags,
        pdf_url: manual.pdfUrl,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      title: data.title,
      category: data.category,
      content: data.content,
      tags: data.tags || [],
      pdfUrl: data.pdf_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateManual(id: string, manual: Partial<Manual>): Promise<Manual> {
    const updateData: Record<string, unknown> = {};

    if (manual.title !== undefined) updateData.title = manual.title;
    if (manual.category !== undefined) updateData.category = manual.category;
    if (manual.content !== undefined) updateData.content = manual.content;
    if (manual.tags !== undefined) updateData.tags = manual.tags;
    if (manual.pdfUrl !== undefined) updateData.pdf_url = manual.pdfUrl;

    const { error } = await supabase
      .from('manuals')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return this.getManualById(id);
  }

  async deleteManual(id: string): Promise<void> {
    const manual = await this.getManualById(id);

    if (manual.pdfUrl) {
      await this.deletePDF(manual.pdfUrl);
    }

    const { error } = await supabase
      .from('manuals')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getFeedback(userId?: string): Promise<Feedback[]> {
    let query = supabase
      .from('feedback')
      .select(`
        *,
        profiles!feedback_user_id_fkey (username, full_name)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: feedbackData, error: feedbackError } = await query;

    if (feedbackError) {
      throw new Error(feedbackError.message);
    }

    const feedbackWithComments = await Promise.all(
      feedbackData.map(async (fb) => {
        const { data: comments, error: commentsError } = await supabase
          .from('admin_comments')
          .select(`
            *,
            profiles!admin_comments_admin_id_fkey (full_name)
          `)
          .eq('feedback_id', fb.id)
          .order('created_at', { ascending: true });

        if (commentsError) {
          throw new Error(commentsError.message);
        }

        return {
          id: fb.id,
          userId: fb.user_id,
          userName: fb.profiles?.full_name || 'Unknown',
          subject: fb.subject,
          message: fb.message,
          status: fb.status,
          createdAt: fb.created_at,
          adminComments: (comments || []).map(comment => ({
            id: comment.id,
            feedbackId: fb.id,
            adminId: comment.admin_id,
            adminName: comment.profiles?.full_name || 'Admin',
            comment: comment.comment,
            createdAt: comment.created_at,
          })),
        };
      })
    );

    return feedbackWithComments;
  }

  async createFeedback(feedback: Omit<Feedback, 'id' | 'createdAt' | 'adminComments' | 'userName'>): Promise<Feedback> {
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: feedback.userId,
        subject: feedback.subject,
        message: feedback.message,
        status: feedback.status,
      })
      .select(`
        *,
        profiles!feedback_user_id_fkey (full_name)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      userId: data.user_id,
      userName: data.profiles?.full_name || 'Unknown',
      subject: data.subject,
      message: data.message,
      status: data.status,
      createdAt: data.created_at,
      adminComments: [],
    };
  }

  async addAdminComment(feedbackId: string, comment: string): Promise<AdminComment> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('admin_comments')
      .insert({
        feedback_id: feedbackId,
        admin_id: user.id,
        comment,
      })
      .select(`
        *,
        profiles!admin_comments_admin_id_fkey (full_name)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      feedbackId,
      adminId: user.id,
      adminName: data.profiles?.full_name || 'Admin',
      comment: data.comment,
      createdAt: data.created_at,
    };
  }

  async updateFeedbackStatus(feedbackId: string, status: 'pending' | 'reviewed' | 'resolved'): Promise<Feedback> {
    const { error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', feedbackId);

    if (error) {
      throw new Error(error.message);
    }

    const { data, error: fetchError } = await supabase
      .from('feedback')
      .select(`
        *,
        profiles!feedback_user_id_fkey (full_name)
      `)
      .eq('id', feedbackId)
      .maybeSingle();

    if (fetchError || !data) {
      throw new Error('Feedback not found');
    }

    const { data: comments } = await supabase
      .from('admin_comments')
      .select(`
        *,
        profiles!admin_comments_admin_id_fkey (full_name)
      `)
      .eq('feedback_id', feedbackId)
      .order('created_at', { ascending: true });

    return {
      id: data.id,
      userId: data.user_id,
      userName: data.profiles?.full_name || 'Unknown',
      subject: data.subject,
      message: data.message,
      status: data.status,
      createdAt: data.created_at,
      adminComments: (comments || []).map(comment => ({
        id: comment.id,
        feedbackId,
        adminId: comment.admin_id,
        adminName: comment.profiles?.full_name || 'Admin',
        comment: comment.comment,
        createdAt: comment.created_at,
      })),
    };
  }

  async getQuizAnalytics() {
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes!quiz_attempts_quiz_id_fkey (title),
        profiles!quiz_attempts_user_id_fkey (username, full_name)
      `)
      .order('completed_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const quizStats = new Map<string, { title: string; attempts: number; totalScore: number; totalPoints: number }>();
    const userStats = new Map<string, { userId: string; userName: string; attempts: number; totalScore: number; totalPoints: number }>();

    attempts.forEach((attempt: {
      quiz_id: string;
      user_id: string;
      score: number;
      total_points: number;
      quizzes: { title: string } | null;
      profiles: { username: string; full_name: string } | null;
    }) => {
      const quizId = attempt.quiz_id;
      const quizTitle = attempt.quizzes?.title || 'Unknown Quiz';

      if (!quizStats.has(quizId)) {
        quizStats.set(quizId, { title: quizTitle, attempts: 0, totalScore: 0, totalPoints: 0 });
      }
      const quizStat = quizStats.get(quizId)!;
      quizStat.attempts++;
      quizStat.totalScore += attempt.score;
      quizStat.totalPoints += attempt.total_points;

      const userId = attempt.user_id;
      const userName = attempt.profiles?.full_name || attempt.profiles?.username || 'Unknown User';

      if (!userStats.has(userId)) {
        userStats.set(userId, { userId, userName, attempts: 0, totalScore: 0, totalPoints: 0 });
      }
      const userStat = userStats.get(userId)!;
      userStat.attempts++;
      userStat.totalScore += attempt.score;
      userStat.totalPoints += attempt.total_points;
    });

    const quizAnalytics = Array.from(quizStats.values()).map(stat => ({
      quizTitle: stat.title,
      attempts: stat.attempts,
      averageScore: stat.attempts > 0 ? Math.round((stat.totalScore / stat.totalPoints) * 100) : 0,
    }));

    const topTrainees = Array.from(userStats.values())
      .map(stat => ({
        userId: stat.userId,
        userName: stat.userName,
        attempts: stat.attempts,
        averageScore: stat.attempts > 0 ? Math.round((stat.totalScore / stat.totalPoints) * 100) : 0,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10);

    return {
      totalAttempts: attempts.length,
      quizAnalytics,
      topTrainees,
    };
  }
}

export const apiService = new ApiService();
