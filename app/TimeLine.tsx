import { Container } from "components/Container";
import Timeline, { TimelineProps } from "components/timeline";


const timelineGroups: TimelineProps['timelineData'] = [
    {
        date: new Date(2024, 11, 21), // December 21, 2024 (month is 0-indexed)
        data: [
            {
                title: "Presentation on Paper",
                subtitle: "IEOM International  Conference",
                isLatest: true,
                content: "Honoured to present our paper 'A large Language Model is not the Right Path to Bring Artificial General Intelligence' on 7th International Conference on Industrial Engineering and Operations Management (IEOM) in Dhaka, BD.",
                date: new Date(2024, 11, 21),
                imageUrl: '/images/aiub.jpeg'
            },
        ],
    },
    {
        date: new Date(2022, 2, 13), // March 13, 2022 (month is 0-indexed)
        data: [
            {
                title: "Winners of Best AI Project",
                subtitle: "Showcasing VirsysAI",
                isLatest: false,
                content: "Secured 1st place in the Best IT Project Competition at the 'Notre Dame Annual Science Festival 2021', showcasing our innovative AI project. 'VirsysAI' much like chatgpt but created even one year beofore of chatgpt.",
                date: new Date(2022, 2, 13),
                imageUrl: '/images/ndc.jpg'
            },
        ],
    },
    {
        date: new Date(2022, 4, 15), // May 15, 2022 (month is 0-indexed)
        data: [
            {
                title: "Winners of Best IT Project",
                subtitle: "Showcasing VirsysAI",
                isLatest: false,
                content: "Again Secured 1st place in the Best IT Project Competition at the '10th National Scientist Mania 2022', showcasing our innovative AI project  'VirsysAI' much like chatgpt but created even one year beofore of chatgpt.",
                date: new Date(2022, 4, 15),
                imageUrl: '/images/gsc.jpg'
            },
        ],
    },

];

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