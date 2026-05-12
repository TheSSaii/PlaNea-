export interface Comment {
  id: number;
  content: string;
  author: string;
  topicId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: number;
  title: string;
  content: string;
  author: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
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
  id: number;
  username: string;
  blockedAt: string;
}