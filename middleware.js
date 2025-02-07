export const config = {
  matcher: [
    '/property/:path*', 
    '/en/property/:path*', 
    '/ja/property/:path*', 
    '/zh/property/:path*',
    '/business/:path*',
    '/en/business/:path*',
    '/ja/business/:path*',
    '/zh/business/:path*'
  ]
};

export default function middleware(request) {
  const url = new URL(request.url);
  
  if (url.pathname.includes('/property') || url.pathname.includes('/business')) {
    // Determine which language version to redirect to
    if (url.pathname.startsWith('/en/')) {
      return Response.redirect(new URL('/en', url.origin));
    } else if (url.pathname.startsWith('/ja/')) {
      return Response.redirect(new URL('/ja', url.origin));
    } else if (url.pathname.startsWith('/zh/')) {
      return Response.redirect(new URL('/zh', url.origin));
    } else {
      return Response.redirect(new URL('/', url.origin));
    }
  }
} 