import { useSelector } from "react-redux";
import EntrepreneurChat from "./EntrepreneurChat";
import UserChat from "./UserChat";

const Community = () => {
    const userData = useSelector((state) => state.auth.userData);
    console.log(userData);
    
    const isEntrepreneur = userData?.usertype === "entrepreneur";

    return (
        <div>
            {isEntrepreneur ? (
                <EntrepreneurChat />
            ) : (
                <UserChat />
            )}
        </div>
    );
};

export default Community;