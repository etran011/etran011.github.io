import icons from "./technology-icons.json";

/** Original Devicon/brand SVGs retain their own fills; only monochrome paths use hex. */
const originalMarks: Record<string, string> = {
  Python: "python-original", R: "r-original", NumPy: "numpy-original", pandas: "pandas-original",
  Matplotlib: "matplotlib-original", Pytest: "pytest-original", Seaborn: "seaborn", "AWS EC2": "aws", Stata: "stata",
};
const localColors: Record<string, string> = { Matplotlib: "#11557c", Seaborn: "#4c72b0", "AWS EC2": "#ff9900", Stata: "#195f92" };
export function technologyBrand(name: string) {
  const icon = icons[name as keyof typeof icons];
  return {
    asset: originalMarks[name],
    // A white mark is the official monochrome treatment for these dark surfaces.
    color: name === "Next.js" || name === "Linux" ? "#f5f5f7" : icon ? `#${icon.hex}` : localColors[name] ?? "#9298a5",
    lightSurface: ["pandas", "Stata", "Excel"].includes(name),
  };
}
