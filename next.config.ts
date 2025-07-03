// next.config.ts
import { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // whitelist i.imgur.com so that <Image src="https://i.imgur.com/..." /> works
   // domains: ["i.imgur.com"],
    // — or, if you’d rather be more specific, you can use remotePatterns:
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgur.com",
        // (optional) you can constrain the pathname pattern if you only use JPGs:
        // pathname: "/**/*.jpg",
      },{
             protocol: "https",
        hostname: "img.clerk.com",
      }
    ],
  },
  // …any other NextConfig options you might have
  
};

export default nextConfig;
