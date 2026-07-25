const ROLE_RULES = [
  { role: "Frontend Developer", skills: ["react", "javascript", "typescript", "html", "css", "tailwind", "vue", "angular"] },
  { role: "Backend Developer", skills: ["node", "express", "java", "python", "django", "spring", "sql", "postgresql", "api"] },
  { role: "Full Stack Developer", skills: ["react", "node", "javascript", "typescript", "mongodb", "postgresql", "express"] },
  { role: "Data Analyst", skills: ["sql", "excel", "power bi", "tableau", "python", "analytics", "statistics"] },
  { role: "Data Scientist", skills: ["python", "machine learning", "tensorflow", "pytorch", "statistics", "pandas", "scikit-learn"] },
  { role: "AI Engineer", skills: ["python", "machine learning", "llm", "nlp", "tensorflow", "pytorch", "openai", "langchain"] },
  { role: "DevOps Engineer", skills: ["docker", "kubernetes", "aws", "azure", "ci/cd", "jenkins", "terraform", "linux"] },
  { role: "QA Engineer", skills: ["testing", "selenium", "cypress", "jest", "postman", "automation", "qa"] },
  { role: "UI/UX Designer", skills: ["figma", "ux", "ui", "wireframing", "prototyping", "design system"] },
  { role: "Mobile Developer", skills: ["react native", "flutter", "android", "ios", "swift", "kotlin"] },
];

const words = (value) => Array.isArray(value) ? value.map(String) : String(value || "").split(/[,;|]/);
const normalise = (values) => words(values).map((value) => value.trim().toLowerCase()).filter(Boolean);

/** Rule-based adapter: replace this function with an ML inference client when one is available. */
function predictRole(profile = {}) {
  const evidence = normalise([...(words(profile.skills)), ...(words(profile.certifications)), ...(words(profile.previous_projects)), profile.preferred_domain]);
  const experience = Math.max(0, Number(profile.experience_years || 0));
  const ranked = ROLE_RULES.map((rule) => {
    const matchingSkills = rule.skills.filter((skill) => evidence.some((item) => item.includes(skill)));
    const coverage = matchingSkills.length / rule.skills.length;
    const score = coverage * 75 + Math.min(experience, 10) * 2.5;
    return { ...rule, matchingSkills, score };
  }).sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const confidence = Math.max(35, Math.min(98, Math.round(best.score + (best.matchingSkills.length ? 10 : 0))));
  return {
    predictedRole: best.matchingSkills.length ? best.role : "Full Stack Developer",
    confidence,
    matchingSkills: best.matchingSkills,
    reason: best.matchingSkills.length
      ? `Matched ${best.matchingSkills.join(", ")} with ${experience} year${experience === 1 ? "" : "s"} of experience.`
      : "Limited skill evidence; a balanced technical profile is currently the closest match.",
  };
}

module.exports = { predictRole, normalise };
