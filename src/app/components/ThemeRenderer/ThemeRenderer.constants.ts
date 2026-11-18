export const postingSummary = (posts: number, replies: number): string =>
  `${posts} ${posts === 1 ? 'post' : 'posts'} this week, ${replies} of them ${replies === 1 ? 'a reply' : 'replies'}`;
