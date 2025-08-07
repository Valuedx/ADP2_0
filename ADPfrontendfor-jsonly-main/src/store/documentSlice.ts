// store/documentSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DocumentState {
  documentId: string | null;
  documentData: Record<string, unknown> | null;
}

const initialState: DocumentState = {
  documentId: null,
  documentData: null,
};

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    setDocumentData: (
      state,
      action: PayloadAction<{ documentId: string; documentData: Record<string, unknown> }>
    ) => {
      state.documentId = action.payload.documentId;
      state.documentData = action.payload.documentData;
    },
    clearDocumentData: (state) => {
      state.documentId = null;
      state.documentData = null;
    },
  },
});

export const { setDocumentData, clearDocumentData } = documentSlice.actions;
export default documentSlice.reducer;