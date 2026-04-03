type ChapterReadState = {
  isRead: boolean;
};

export const resolveHomeCollection = (
  chapters: ChapterReadState[],
): 'tracking' | 'library' => {
  return chapters.some((chapter) => !chapter.isRead) ? 'tracking' : 'library';
};
