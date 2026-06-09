import fs from 'fs';
import path from 'path';

const REPO_OWNER = 'Om-Wani-07';
const REPO_NAME = 'Indian-Restaurant-Mobile-App';

async function fetchFromGithub(apiPath: string) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${apiPath}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${apiPath}: ${response.statusText}`);
  }
  return response.json();
}

async function getRawFile(downloadUrl: string) {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to download raw file: ${response.statusText}`);
  }
  return response.text();
}

async function run() {
  try {
    console.log("Fetching RestaurantRepository.kt...");
    const repoInfo = await fetchFromGithub('app/src/main/java/com/example/data/RestaurantRepository.kt') as any;
    const repoContent = await getRawFile(repoInfo.download_url);
    
    console.log("Saving RestaurantRepository.kt...");
    fs.mkdirSync('./temp_code', { recursive: true });
    fs.writeFileSync('./temp_code/RestaurantRepository.kt', repoContent);
    console.log("RestaurantRepository.kt saved successfully! Size:", repoContent.length);

    console.log("Fetching RestaurantViewModel.kt...");
    const vmInfo = await fetchFromGithub('app/src/main/java/com/example/ui/viewmodel/RestaurantViewModel.kt') as any;
    const vmContent = await getRawFile(vmInfo.download_url);
    
    console.log("Saving RestaurantViewModel.kt...");
    fs.writeFileSync('./temp_code/RestaurantViewModel.kt', vmContent);
    console.log("RestaurantViewModel.kt saved! Size:", vmContent.length);

    console.log("Done!");
  } catch (error) {
    console.error("Error fetching repository files:", error);
  }
}

run();
