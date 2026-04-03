import { NavigatorScreenParams } from '@react-navigation/native';

export type HomeStackParamList = {
  HomeMain: undefined;
  Search: { initialQuery?: string } | undefined;
  Import: undefined;
  SeriesDetail: { seriesId: string };
  ChapterDetail: { seriesId: string; chapterId: string };
  ChapterCreate: { seriesId: string };
  SeriesManage: { seriesId?: string } | undefined;
};

export type LibraryStackParamList = {
  HomeMain: undefined;
  Import: undefined;
  SeriesDetail: { seriesId: string };
  ChapterDetail: { seriesId: string; chapterId: string };
  ChapterCreate: { seriesId: string };
  SeriesManage: { seriesId?: string } | undefined;
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  Library: NavigatorScreenParams<LibraryStackParamList> | undefined;
  Settings: undefined;
};
