// Minimal valid module to replace placeholder that breaks build
export type BlogPost = {
  id: string;
  title: string;
  slug?: string;
  content?: string;
  date?: string;
  city?: string;
  excerpt?: string;
};

export const blogPosts: BlogPost[] = [];
