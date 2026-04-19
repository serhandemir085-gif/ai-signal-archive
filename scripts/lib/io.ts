import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export async function readJson<T>(path: string): Promise<T> {
  const file = await readFile(resolve(path), "utf8");
  return JSON.parse(file) as T;
}

export async function writeJson(path: string, value: unknown) {
  const target = resolve(path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
