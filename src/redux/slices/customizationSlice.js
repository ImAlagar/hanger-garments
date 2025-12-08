// redux/slices/customizationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Current design being edited
  currentDesign: null,
  // Design layers and state
  designData: {
    layers: [],
    canvasSize: { width: 800, height: 600 },
    backgroundColor: '#ffffff',
    selectedImage: null, // ✅ STEP 1: Add selectedImage here
    selectedColor: null  // ✅ STEP 1: Add selectedColor here
  },
  // Customization options
  customizationOptions: null,
  // UI state
  isDesignMode: false,
  loading: false,
  error: null,
  // Preview state
  preview: {
    image: null,
    isLoading: false,
  }
};

const customizationSlice = createSlice({
  name: 'customization',
  initialState,
  reducers: {
    // Design management
    setCurrentDesign: (state, action) => {
      state.currentDesign = action.payload;
    },
    setDesignData: (state, action) => {
      state.designData = { ...state.designData, ...action.payload };
    },
    
    // ✅ STEP 2: Add setSelectedImage reducer
    setSelectedImage: (state, action) => {
      state.designData.selectedImage = action.payload;
    },
    
    // ✅ STEP 3: Add setSelectedColor reducer
    setSelectedColor: (state, action) => {
      state.designData.selectedColor = action.payload;
    },
    
    updateDesignLayers: (state, action) => {
      state.designData.layers = action.payload;
    },
    addDesignLayer: (state, action) => {
      state.designData.layers.push(action.payload);
    },
    updateDesignLayer: (state, action) => {
      const { layerId, updates } = action.payload;
      const layerIndex = state.designData.layers.findIndex(layer => layer.id === layerId);
      if (layerIndex !== -1) {
        state.designData.layers[layerIndex] = {
          ...state.designData.layers[layerIndex],
          ...updates
        };
      }
    },
    removeDesignLayer: (state, action) => {
      state.designData.layers = state.designData.layers.filter(
        layer => layer.id !== action.payload
      );
    },
    reorderDesignLayers: (state, action) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedLayer] = state.designData.layers.splice(fromIndex, 1);
      state.designData.layers.splice(toIndex, 0, movedLayer);
    },

    // Customization options
    setCustomizationOptions: (state, action) => {
      state.customizationOptions = action.payload;
    },

    // UI state
    setDesignMode: (state, action) => {
      state.isDesignMode = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Preview state
    setPreviewImage: (state, action) => {
      state.preview.image = action.payload;
    },
    setPreviewLoading: (state, action) => {
      state.preview.isLoading = action.payload;
    },

    // Reset state
    resetDesign: (state) => {
      // ✅ STEP 4: Update resetDesign to also reset selectedImage
      state.designData = {
        ...initialState.designData,
        selectedImage: null,
        selectedColor: null
      };
      state.currentDesign = null;
    },
    resetCustomization: () => initialState,
  },
});

// ✅ STEP 5: Export the new actions
export const {
  setCurrentDesign,
  setDesignData,
  setSelectedImage,    // ✅ Export
  setSelectedColor,    // ✅ Export
  updateDesignLayers,
  addDesignLayer,
  updateDesignLayer,
  removeDesignLayer,
  reorderDesignLayers,
  setCustomizationOptions,
  setDesignMode,
  setLoading,
  setError,
  clearError,
  setPreviewImage,
  setPreviewLoading,
  resetDesign,
  resetCustomization,
} = customizationSlice.actions;

export default customizationSlice.reducer;