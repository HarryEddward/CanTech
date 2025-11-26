import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-indigo-950">
      <main className="w-full flex min-h-screen flex-col items-center justify-center px-6 py-16 sm:max-w-3xl sm:justify-between sm:py-32 sm:px-16">
        
        <div className="w-full flex flex-col justify-center items-center gap-4 text-center sm:gap-6 sm:items-start sm:text-left">
          <h1 className="text-9xl font-semibold leading-tight tracking-tight text-white sm:text-9xl sm:leading-10 font-sans">
            Ca&apos;n Tech
          </h1>
        </div>
      </main>
    </div>
  );
}