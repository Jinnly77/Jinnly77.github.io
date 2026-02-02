export interface PostMeta {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  category?: string;
}

export interface Post {
  slug: string;
  meta: PostMeta;
  content: string;
  html: string;
}

export const posts: Post[];
