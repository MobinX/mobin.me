import { Article } from "contentlayer/generated";
import Image from "next/image";
import Link from "next/link";

export default function AuthorCard({
  article,
}: {
  article: Article;
}): JSX.Element {
  return (
    <div className="px-8 py-8 mt-12 text-zinc-600 dark:text-zinc-400 rounded-2xl bg-gray-100 dark:bg-zinc-800">
      <div className="flex flex-wrap items-start sm:space-x-6 sm:flex-nowrap">
        <div className="relative flex-shrink-0 w-24 h-24 mt-1 ">
          <span>
            <Image
              alt={article.author.name}
              sizes="100vw"
              src={`/images/${article.author.avatar.url}`}
              width={30}
              height={30}
              className="rounded-full absolute inset-0 box-border p-0 border-none m-auto block w-0 h-0 min-w-full max-w-full min-h-full max-h-full object-cover"
            />
          </span>
        </div>
        <div>
          <div className="mb-3">
            <h4 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">
              About{" "}
              <Link href={article.author.url || ""}>{article.author.name}</Link>
            </h4>
          </div>
          <div>
            <p className="text-justify">
              <Link href={article.author.url || ""}> Md. Mobin Chowdhury</Link>{" "}
              is an undergraduate Physics student at University of Dhaka, combining theoretical physics research with self-taught expertise in AI and quantum computing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
