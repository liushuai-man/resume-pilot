const normalize = (value: string) => value
  .toLocaleLowerCase('zh-CN')
  .replace(/[`*_>#\-]/g, '')
  .replace(/[\s，。；、,.!?！？：:;（）()【】\[\]]+/g, '');

export function filterDistinctAchievements(
  description: unknown,
  achievements: unknown
): string[] {
  const descriptionText = typeof description === 'string' ? description : '';
  const descriptionNormalized = normalize(descriptionText);
  const seen = new Set<string>();

  return (Array.isArray(achievements) ? achievements : [])
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .filter((item) => {
      const normalized = normalize(item);
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      // 只过滤完整包含关系，不进行模糊改写判断，避免隐藏含义相近但结果不同的成果。
      return normalized.length < 8 || !descriptionNormalized.includes(normalized);
    });
}
