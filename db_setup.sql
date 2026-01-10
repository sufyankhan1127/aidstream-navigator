-- 1. Enable the Vector extension for AI embeddings
create extension if not exists vector;

-- 2. Create the table to store benefits/schemes
create table schemes (
  id bigserial primary key,
  title text not null,
  description text not null,
  category text not null,
  embedding vector(768) -- Matches Gemini embedding dimension
);

-- 3. Create the search function (Remote Procedure Call)
create or replace function match_schemes (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  title text,
  description text,
  category text,
  similarity float
)
language plpgsql
as NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_API_KEY=your-gemini-api-key
begin
  return query
  select
    schemes.id,
    schemes.title,
    schemes.description,
    schemes.category,
    1 - (schemes.embedding <=> query_embedding) as similarity
  from schemes
  where 1 - (schemes.embedding <=> query_embedding) > match_threshold
  order by schemes.embedding <=> query_embedding
  limit match_count;
end;
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_API_KEY=your-gemini-api-key;
