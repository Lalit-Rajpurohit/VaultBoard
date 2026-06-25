import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Notes: undefined;
  Boards: undefined;
  Vault: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  NoteEditor: { id?: string } | undefined;
  NoteDetail: { id: string };
  BoardDetail: { id: string };
  Tasks: undefined;
  Search: undefined;
  TagsFolders: undefined;
  BackupRestore: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
