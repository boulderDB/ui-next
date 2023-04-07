const moduleExports = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const entries = [];

    if (process.env.NEXT_PUBLIC_API_PROXY) {
      entries.push({
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_PROXY}/api/:path*`,
        basePath: false,
      });
    }

    return entries;
  },
};

module.exports = moduleExports;
