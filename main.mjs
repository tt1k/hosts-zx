#!/usr/bin/env zx

const githubURL = [
  'github.githubassets.com',
  'central.github.com',
  'desktop.githubusercontent.com',
  'assets-cdn.github.com',
  'camo.githubusercontent.com',
  'github.map.fastly.net',
  'github.global.ssl.fastly.net',
  'gist.github.com',
  'github.io',
  'github.com',
  'api.github.com',
  'raw.githubusercontent.com',
  'user-images.githubusercontent.com',
  'favicons.githubusercontent.com',
  'avatars5.githubusercontent.com',
  'avatars4.githubusercontent.com',
  'avatars3.githubusercontent.com',
  'avatars2.githubusercontent.com',
  'avatars1.githubusercontent.com',
  'avatars0.githubusercontent.com',
  'avatars.githubusercontent.com',
  'codeload.github.com',
  'github-cloud.s3.amazonaws.com',
  'github-com.s3.amazonaws.com',
  'github-production-release-asset-2e65be.s3.amazonaws.com',
  'github-production-user-asset-6210df.s3.amazonaws.com',
  'github-production-repository-file-5c1aeb.s3.amazonaws.com',
  'githubstatus.com',
  'github.community',
  'media.githubusercontent.com'
];

async function findIP(host) {
  const hostBody = host.split(".");
  let url = "";
  
  if (hostBody.length == 2) {
    url = "https://" + host + ".ipaddress.com";
  } else {
    url = "https://" + hostBody[hostBody.length - 2] + "." + hostBody[hostBody.length - 1] + ".ipaddress.com/" + host;
  }
  
  const response = await fetch(url);
  const htmlText = await response.text();
  
  const dnsInfoReg = /tbody id="dnsinfo".*tbody/gi;
  const IPReg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
  const result = IPReg.exec(htmlText.match(dnsInfoReg))[0];
  
  return result;
}

async function findIPWrapper(host) {
  let retryCount = 3;
  let result = "";

  try {
    result = await findIP(host);
  } catch (err) {
    if (retryCount > 1) {
      retryCount--;
      result = await findIP(host);
    } else {
      console.log("[error]: %s is failed", host);
    }
  }

  return result;
}

async function acquireGithubHosts() {
  let hostsContent = "";
  
  for (let index = 0; index < githubURL.length; index++) {
    console.log("[process]: %d/%d %s", index + 1, githubURL.length, githubURL[index]);
    const result = await findIPWrapper(githubURL[index]);
    if (result && result.length) {
      let hostContent = result + Array(30 - result.length).join(' ');
      hostsContent += hostContent + githubURL[index] + "\n";
    }
  }

  try {
    const date = new Date();
    const updateTime = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    const readmeTemplate = "# hosts-zx\nhosts-zx is a script auto updating hosts of listed urls, written in [google-zx](https://github.com/google/zx)\n## hosts\nupdate at: {update_time}\n```shell\n{host_content}```\n## license\n[MIT](LICENSE)";
    let content = readmeTemplate.replace('{host_content}', hostsContent).replace('{update_time}', updateTime);
    await fs.writeFile("./README.md", content);
  } catch (err) {
    console.log("[error]: %s", err.message);
  }
}

async function main() {
  await acquireGithubHosts();
}

main();