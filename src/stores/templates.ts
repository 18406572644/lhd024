import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Template, TemplateCategoryType, CapsuleCategory, MoodType, ExportedTemplate } from '../types';
import { PRESET_TEMPLATES, createEmptyTemplate } from '../data/templates';
import { getStorage, setStorage } from '../utils/storage';

const STORAGE_KEY = 'capsule_templates';
const CUSTOM_TEMPLATES_KEY = 'custom_capsule_templates';

export const useTemplatesStore = defineStore('templates', () => {
  const presetTemplates = ref<Template[]>([...PRESET_TEMPLATES]);
  const customTemplates = ref<Template[]>(getStorage<Template[]>(CUSTOM_TEMPLATES_KEY, []));
  const loading = ref(false);
  const searchQuery = ref('');
  const selectedCategory = ref<TemplateCategoryType | 'all'>('all');

  const allTemplates = computed(() => [
    ...presetTemplates.value,
    ...customTemplates.value,
  ]);

  const templatesByCategory = computed(() => {
    if (selectedCategory.value === 'all') {
      return allTemplates.value;
    }
    return allTemplates.value.filter(t => t.category === selectedCategory.value);
  });

  const filteredTemplates = computed(() => {
    let templates = templatesByCategory.value;
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return templates;
  });

  const favoriteTemplates = computed(() =>
    allTemplates.value.filter(t => t.isFavorite)
  );

  const customTemplatesList = computed(() => customTemplates.value);

  function loadTemplates() {
    customTemplates.value = getStorage<Template[]>(CUSTOM_TEMPLATES_KEY, []);
  }

  function saveCustomTemplates() {
    setStorage(CUSTOM_TEMPLATES_KEY, customTemplates.value);
  }

  function getTemplateById(id: string): Template | undefined {
    return allTemplates.value.find(t => t.id === id);
  }

  function getTemplatesByCategory(category: TemplateCategoryType): Template[] {
    return allTemplates.value.filter(t => t.category === category);
  }

  function getSmartRecommendations(
    capsuleCategory: CapsuleCategory,
    mood: MoodType,
    limit: number = 3
  ): Template[] {
    const scored = allTemplates.value.map(template => {
      let score = 0;

      if (template.suitableCategories.includes(capsuleCategory)) {
        score += 3;
      }

      if (template.suitableMoods.includes(mood)) {
        score += 2;
      }

      const categoryMatch = template.suitableCategories.length > 0 ?
        template.suitableCategories.filter(c => c === capsuleCategory).length / template.suitableCategories.length : 0;
      const moodMatch = template.suitableMoods.length > 0 ?
        template.suitableMoods.filter(m => m === mood).length / template.suitableMoods.length : 0;

      score += (categoryMatch + moodMatch) * 2;

      score += template.usageCount * 0.1;

      if (template.isFavorite) {
        score += 1;
      }

      return { template, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.template);
  }

  function createTemplate(template: Partial<Template>): Template {
    const newTemplate: Template = {
      ...createEmptyTemplate(),
      ...template,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isCustom: true,
    };
    customTemplates.value.push(newTemplate);
    saveCustomTemplates();
    return newTemplate;
  }

  function updateTemplate(id: string, data: Partial<Template>): Template | undefined {
    const index = customTemplates.value.findIndex(t => t.id === id);
    if (index !== -1) {
      customTemplates.value[index] = { ...customTemplates.value[index], ...data };
      saveCustomTemplates();
      return customTemplates.value[index];
    }
    return undefined;
  }

  function deleteTemplate(id: string): boolean {
    const index = customTemplates.value.findIndex(t => t.id === id);
    if (index !== -1) {
      customTemplates.value.splice(index, 1);
      saveCustomTemplates();
      return true;
    }
    return false;
  }

  function toggleFavorite(id: string): boolean {
    const presetIndex = presetTemplates.value.findIndex(t => t.id === id);
    if (presetIndex !== -1) {
      presetTemplates.value[presetIndex].isFavorite = !presetTemplates.value[presetIndex].isFavorite;
      return presetTemplates.value[presetIndex].isFavorite;
    }

    const customIndex = customTemplates.value.findIndex(t => t.id === id);
    if (customIndex !== -1) {
      customTemplates.value[customIndex].isFavorite = !customTemplates.value[customIndex].isFavorite;
      saveCustomTemplates();
      return customTemplates.value[customIndex].isFavorite;
    }

    return false;
  }

  function incrementUsage(id: string): void {
    const presetIndex = presetTemplates.value.findIndex(t => t.id === id);
    if (presetIndex !== -1) {
      presetTemplates.value[presetIndex].usageCount++;
    }

    const customIndex = customTemplates.value.findIndex(t => t.id === id);
    if (customIndex !== -1) {
      customTemplates.value[customIndex].usageCount++;
      saveCustomTemplates();
    }
  }

  function exportTemplate(id: string): string | null {
    const template = getTemplateById(id);
    if (!template) return null;

    const exported: ExportedTemplate = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      template: { ...template, id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` },
    };

    return JSON.stringify(exported, null, 2);
  }

  function importTemplate(jsonString: string): Template | null {
    try {
      const data = JSON.parse(jsonString);

      if (!data.template || !data.version) {
        throw new Error('Invalid template format');
      }

      const imported = createTemplate({
        ...data.template,
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isCustom: true,
        isFavorite: false,
        usageCount: 0,
        createdAt: new Date().toISOString(),
      });

      return imported;
    } catch (e) {
      console.error('Failed to import template:', e);
      return null;
    }
  }

  function downloadTemplate(id: string): void {
    const json = exportTemplate(id);
    if (!json) return;

    const template = getTemplateById(id);
    if (!template) return;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${template.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  function setSelectedCategory(category: TemplateCategoryType | 'all') {
    selectedCategory.value = category;
  }

  loadTemplates();

  return {
    presetTemplates,
    customTemplates,
    allTemplates,
    templatesByCategory,
    filteredTemplates,
    favoriteTemplates,
    customTemplatesList,
    loading,
    searchQuery,
    selectedCategory,
    loadTemplates,
    getTemplateById,
    getTemplatesByCategory,
    getSmartRecommendations,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleFavorite,
    incrementUsage,
    exportTemplate,
    importTemplate,
    downloadTemplate,
    setSearchQuery,
    setSelectedCategory,
  };
});
