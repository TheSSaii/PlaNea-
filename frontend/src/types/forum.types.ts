export interface Author {
  id: string;
  name: string | null;
}

export interface Comment {
  id: string;
  content: string;
  author: Author;
  topicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForumLike {
  id: string;
  topicId: string;
  username: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  author: Author;
  imageUrl?: string;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  likes: ForumLike[];
}

export interface CreateTopicDto {
  title: string;
  content: string;
  author: string;
}

export interface CreateCommentDto {
  content: string;
  author: string;
}

export interface BlockedUser {
  id: string;
  username: string;
  blockedAt: string;
}