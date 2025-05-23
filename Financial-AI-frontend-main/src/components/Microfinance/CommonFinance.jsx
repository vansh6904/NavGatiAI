import { useSelector } from "react-redux";
import Microfinance from "./Microfinance";
import EntrepreneurFinance from "./EntrepreneurFinance";

const CommonFinance = () => {
    const userData = useSelector(state => state.auth.userData);
    const isEntrepreneur = userData?.usertype === "entrepreneur";

    return (
        <div>
            {isEntrepreneur ? (
                <Microfinance />
            ) : (
                <Microfinance />
            )}
        </div>
    );
};

export default CommonFinance;