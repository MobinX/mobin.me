import { Container } from "components/Container";
import { ChevronDownIcon } from "components/Icons";
import Timeline, { TimelineProps } from "components/timeline";
import { timelineGroups } from "content/timeline";
import Link from "next/link";



export const TimelineComponent = () => {
    return (
        <Container className="mt-12">
            <div className="max-w-3xl">
                <h3 className="font-bold text-2xl md:text-4xl tracking-tight mb-6 text-zinc-800 dark:text-zinc-100">
                    Events
                </h3>
                <Timeline timelineData={timelineGroups} />
                <div className="flex justify-center mt-0">
                    <Link
                        href="/events"
                        className="group flex items-center text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:text-teal-500 dark:hover:text-teal-500"
                    >
                        Show more
                        <ChevronDownIcon className="ml-3 h-auto w-[10px] stroke-zinc-500 group-hover:stroke-teal-500 dark:group-hover:stroke-teal-500" />
                    </Link>
                </div>
            </div>
        </Container>
    )
}
    ;