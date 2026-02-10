 import { Routes, Route, useLocation } from "react-router-dom";
 import { MobileSidebarProvider } from "./context/MobileSidebarContext";
 import { MobileTocProvider } from "./context/MobileTocContext";
 import Layout from "./components/Layout";
 import Index from "./pages/Index";
 import Post from "./pages/Post";
 import Categories from "./pages/Categories";
 import CategoryPosts from "./pages/CategoryPosts";
 import Tags from "./pages/Tags";
 import TagPosts from "./pages/TagPosts";
 import Archive from "./pages/Archive";
 import About from "./pages/About";
 import { useEffect } from "react";

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return <>{children}</>;
}

 export default function App() {
   return (
     <MobileSidebarProvider>
       <MobileTocProvider>
         <PageTransition>
           <Routes>
             <Route path="/" element={<Layout />}>
               <Route index element={<Index />} />
               <Route path="post/:slug" element={<Post />} />
               <Route path="categories" element={<Categories />} />
               <Route path="categories/:name" element={<CategoryPosts />} />
               <Route path="tags" element={<Tags />} />
               <Route path="tags/:name" element={<TagPosts />} />
               <Route path="archive" element={<Archive />} />
               <Route path="about" element={<About />} />
             </Route>
           </Routes>
         </PageTransition>
       </MobileTocProvider>
     </MobileSidebarProvider>
   );
 }
