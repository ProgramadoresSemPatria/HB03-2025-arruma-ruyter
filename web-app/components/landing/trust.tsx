import Image from "next/image";

export function Trust() {
  return (
    <section className="py-16 ">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          <p className="text-center text-sm font-semibold leading-8 text-gray-900 ">
            Trusted by
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Image src="/borderless-logo.svg" alt="Borderless Coding" width={48} height={48} />
            <span className="text-lg font-bold text-gray-800">Borderless Coding</span>
          </div>
        </div>
      </div>
    </section>
  );
}

