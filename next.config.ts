import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // kakkaobot !질문 OAuth: user_id+draft_id 있으면 OAuth 시작으로 (쿼리 유지)
      {
        source: "/login",
        has: [
          { type: "query", key: "user_id" },
          { type: "query", key: "draft_id" },
        ],
        destination: "/oauth/naver/start",
        permanent: false,
      },
      {
        source: "/",
        has: [
          { type: "query", key: "user_id" },
          { type: "query", key: "draft_id" },
        ],
        destination: "/oauth/naver/start",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
