import ProductsCarrousel from "@/components/ProductsCarrousel";

export default function Home() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <main className="w-full flex min-h-screen flex-col items-center justify-center px-6 py-4 sm:max-w-5xl sm:justify-between sm:py-32 sm:px-16">
        
        <ProductsCarrousel/>
        {/* Título */}
        <div className="w-full flex flex-col justify-center items-center text-center relative">
            <h1 className="text-9xl sm:text-8xl font-semibold text-slate-500 font-calistoga">
            Ca&apos;n Tech
            </h1>
            <div className="absolute top-25 w-full bg-gradient-to-b from-slate-500 to-slate-950 h-40"/>
        </div>

        <ProductsCarrousel/>
        <ProductsCarrousel/>


      </main>
    </div>
  );
}