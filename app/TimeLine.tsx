import { Container } from "components/Container";
import Timeline, { TimelineProps } from "components/timeline";
import { timelineGroups } from "content/timeline";



export const TimelineComponent = () => {
    return (
        <Container className="mt-12">
            <div className="max-w-3xl">
                <h3 className="font-bold text-2xl md:text-4xl tracking-tight mb-6 text-zinc-800 dark:text-zinc-100">
                    Events
                </h3>
                <Timeline timelineData={timelineGroups} />
            </div>
        </Container>
    )
}
    ;