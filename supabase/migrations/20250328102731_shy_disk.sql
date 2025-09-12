/*
  Updated policies & FK for full owner-managed editing/deletion.
  Safe to re-run (drops/recreates policies & FK as needed).
*/

-- Ensure RLS is enabled (safe to re-run)
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.user_progress enable row level security;

-- =========================
-- Quizzes
-- =========================
drop policy if exists "Anyone can view quizzes" on public.quizzes;
create policy "Anyone can view quizzes"
  on public.quizzes for select
  to authenticated
  using (true);

drop policy if exists "Users can create quizzes" on public.quizzes;
create policy "Users can create quizzes"
  on public.quizzes for insert
  to authenticated
  with check (auth.uid() = created_by);

-- NEW: allow owners to update/delete their quizzes
drop policy if exists "update own quizzes" on public.quizzes;
create policy "update own quizzes"
  on public.quizzes for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "delete own quizzes" on public.quizzes;
create policy "delete own quizzes"
  on public.quizzes for delete
  to authenticated
  using (auth.uid() = created_by);

-- =========================
-- Questions (owner-scoped CRUD)
-- =========================
drop policy if exists "Anyone can view questions" on public.questions;
create policy "Anyone can view questions"
  on public.questions for select
  to authenticated
  using (true);

drop policy if exists "insert questions for own quizzes" on public.questions;
create policy "insert questions for own quizzes"
  on public.questions for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.quizzes q
      where q.id = questions.quiz_id
        and q.created_by = auth.uid()
    )
  );

drop policy if exists "update questions for own quizzes" on public.questions;
create policy "update questions for own quizzes"
  on public.questions for update
  to authenticated
  using (
    exists (
      select 1
      from public.quizzes q
      where q.id = questions.quiz_id
        and q.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.quizzes q
      where q.id = questions.quiz_id
        and q.created_by = auth.uid()
    )
  );

drop policy if exists "delete questions for own quizzes" on public.questions;
create policy "delete questions for own quizzes"
  on public.questions for delete
  to authenticated
  using (
    exists (
      select 1
      from public.quizzes q
      where q.id = questions.quiz_id
        and q.created_by = auth.uid()
    )
  );

-- =========================
-- Answers (owner-scoped CRUD)
-- =========================
drop policy if exists "Anyone can view answers" on public.answers;
create policy "Anyone can view answers"
  on public.answers for select
  to authenticated
  using (true);

drop policy if exists "insert answers for own quizzes" on public.answers;
create policy "insert answers for own quizzes"
  on public.answers for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.questions qq
      join public.quizzes q on q.id = qq.quiz_id
      where qq.id = answers.question_id
        and q.created_by = auth.uid()
    )
  );

drop policy if exists "update answers for own quizzes" on public.answers;
create policy "update answers for own quizzes"
  on public.answers for update
  to authenticated
  using (
    exists (
      select 1
      from public.questions qq
      join public.quizzes q on q.id = qq.quiz_id
      where qq.id = answers.question_id
        and q.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.questions qq
      join public.quizzes q on q.id = qq.quiz_id
      where qq.id = answers.question_id
        and q.created_by = auth.uid()
    )
  );

drop policy if exists "delete answers for own quizzes" on public.answers;
create policy "delete answers for own quizzes"
  on public.answers for delete
  to authenticated
  using (
    exists (
      select 1
      from public.questions qq
      join public.quizzes q on q.id = qq.quiz_id
      where qq.id = answers.question_id
        and q.created_by = auth.uid()
    )
  );

-- =========================
-- User Progress (keep your existing policy)
-- =========================
drop policy if exists "Users can track their progress" on public.user_progress;
create policy "Users can track their progress"
  on public.user_progress for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Make progress rows cascade when a quiz is deleted (so delete works cleanly)
alter table public.user_progress
  drop constraint if exists user_progress_quiz_id_fkey;

alter table public.user_progress
  add constraint user_progress_quiz_id_fkey
  foreign key (quiz_id) references public.quizzes(id)
  on delete cascade;
