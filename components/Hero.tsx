import Link from "next/link";

export default function Hero() {
  return (
    <section className="flex min-h-[85vh] flex-col items-center justify-center bg-black text-center text-white px-6">
      <h1 className="text-5xl md:text-7xl font-extrabold">
        COOL AI QUIZZ
      </h1>

      <p className="mt-5 text-xl text-cyan-400">
        Play. Learn. Crack.
      </p>

      <p className="mt-8 max-w-2xl text-zinc-400">
        AI Powered Quiz Platform for SSC, UPSC, Banking, Railway,
        NEET, JEE and many more exams.
      </p>

      <div className="mt-10 flex gap-4">
        <Link href="/dashboard">
          <button className="bg-cyan-500 px-7 py-3 rounded-xl text-black font-bold hover:scale-105 transition">
            Start Quiz
          </button>
        </Link>

        <button className="border border-cyan-500 px-7 py-3 rounded-xl hover:bg-cyan-500 hover:text-black transition">
          Learn More
        </button>
      </div>
    </section>
  );
}