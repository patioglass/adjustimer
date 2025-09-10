import { videoProps } from "../../../constants";

const Timer = (props: videoProps) => {
    const { currentVideo } = props;
    return (
        <div className="
            p-24
            w-screen
            font-sans
            text-center
            bg-gray-300
            grow
        ">
            <p className="text-2xl">{currentVideo.title}</p>
            <p className="text-xl">{currentVideo.subTitle}</p>
            <p className="mt-10 text-6xl">{currentVideo.currentTime}</p>
        </div>
    );
}

export default Timer