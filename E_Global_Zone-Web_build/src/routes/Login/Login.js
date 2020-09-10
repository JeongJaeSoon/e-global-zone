import React, { useRef, useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logIn, setClass } from "../../redux/userSlice/userSlice";
import { blankValidator } from "../../modules/validator";
import conf from "../../conf/conf";
// import { postLoginForeigner } from "../../modules/hooks/useAxios";
import { postForeignerLogin } from "../../api/foreigner";
import { GoogleLogin } from "react-google-login";
import { isMobile } from "react-device-detect";
import { postKoreanLogin } from "../../api/korean";
import { getDepartment } from "../../api/axios";
import { setDept } from "../../redux/confSlice/confSlice";
import { postAdminLogin, postReset } from "../../api/admin";
import { handleEnterKey } from "../../modules/handleEnterKey";

const Login = () => {
	const id = useRef();
	const pw = useRef();

	const [data, setData] = useState();
	const [pending, setPending] = useState(false);

	useEffect(() => {
		if (window.localStorage.getItem("global-zone-korean-token")) {
			// useGoogleLogin();
		}
	}, []);

	useEffect(() => {
		if (pending) {
			if (data) {
				if (data.data && data.data.token) {
					window.localStorage.setItem("global-zone-foreigner-token", data.data.token);
					window.localStorage.setItem("global-zone-loginId", data.data.info.std_for_id);
					window.localStorage.setItem(
						"global-zone-loginName",
						data.data.info.std_for_name
					);
					window.localStorage.setItem("global-zone-userClass", conf.userClass.FOREIGNER);
					window.localStorage.setItem("global-zone-isLogin", true);
					window.location.replace("/");
				} else {
					document.getElementById("password").innerHTML = data;
					document.getElementById("root").style.display = "none";
				}
			}
		}
		return;
	}, [pending, data]);

	const handleLogin = () => {
		const { value: idValue } = id.current;
		const { value: pwValue } = pw.current;
		if (blankValidator(idValue, pwValue));
		postForeignerLogin({ std_for_id: idValue, password: pwValue }).then((res) => {
			setPending(true);
			res.status === 200 && setData(res.data);
		});
	};

	return (
		<div className="content">
			<div className="sub_title">
				<p className="tit">글로벌존 서비스 로그인</p>
			</div>
			<div className="login_wrap">
				<p className="tit">Login</p>
				<LoginHeader />
				<div className="login_input">
					<input
						onKeyUp={(e) => handleEnterKey(e, handleLogin)}
						type="text"
						name="id"
						placeholder="학번을 입력해주세요."
						ref={id}
					/>
					<input
						onKeyUp={(e) => handleEnterKey(e, handleLogin)}
						type="password"
						name="password"
						placeholder="비밀번호를 입력해주세요."
						ref={pw}
					/>
					<div className="submit" onClick={handleLogin}>
						로그인
					</div>
				</div>
			</div>
		</div>
	);
};

export const MobileLogin = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const onSuccess = (res) => {
		window.localStorage.clear();
		if (res.profileObj.email.split("@")[1] !== "g.yju.ac.kr") {
			alert("영진전문대학교 g-suite 계정을 사용하셔야 합니다.");
		} else {
			window.localStorage.setItem("global-zone-korean-token", res.accessToken);
			postKoreanLogin()
				.then((response) => {
					if (response.status === 202) {
						history.push("/korean/signup", { email: res.profileObj.email });
					} else if (response.status === 200) {
						alert(response.data.message);
						const { std_kor_id, std_kor_name } = response.data.data;
						dispatch(setClass([std_kor_id, conf.userClass.KOREAN, std_kor_name]));
						dispatch(logIn());
						history.push("/");
					} else if (response.status === 203) {
						alert(response.data.message);
						window.localStorage.clear();
					}
				})
				.catch((e) => alert(e.res.data.message));
		}
	};
	const onFailure = (e) => {};
	useEffect(() => {
		getDepartment().then((res) => dispatch(setDept(res.data)));
	}, []);

	return (
		<div className="wrap mobile_login">
			<GoogleLogin
				clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
				buttonText="Google"
				render={(renderProps) => (
					<div
						className="btn"
						onClick={renderProps.onClick}
						disabled={renderProps.disabled}
					>
						G-suite 계정으로 로그인하기
					</div>
				)}
				onSuccess={onSuccess}
				onFailure={onFailure}
				isSignedIn={true}
			/>
			<p>@g.yju.ac.kr 로 끝나는 G-suite 계정만 사용이 가능합니다.</p>
		</div>
	);
};

export const KoreanLogin = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const onSuccess = (res) => {
		window.localStorage.clear();
		if (res.profileObj.email.split("@")[1] !== "g.yju.ac.kr") {
			alert("영진전문대학교 g-suite 계정을 사용하셔야 합니다.");
		} else {
			window.localStorage.setItem("global-zone-korean-token", res.accessToken);
			postKoreanLogin()
				.then((response) => {
					if (response.status === 202) {
						history.push("/korean/signup", { email: res.profileObj.email });
					} else if (response.status === 200) {
						alert(response.data.message);
						const { std_kor_id, std_kor_name } = response.data.data;
						dispatch(setClass([std_kor_id, conf.userClass.KOREAN, std_kor_name]));
						// window.localStorage.setItem("global-zone-loginId", std_kor_id);
						// window.localStorage.setItem("global-zone-loginName", std_kor_name);
						// window.localStorage.setItem("global-zone-userClass", conf.userClass.KOREAN);
						// window.localStorage.setItem("global-zone-isLogin", true);
						dispatch(logIn());
						history.push("/");
					} else if (response.status === 203) {
						alert(response.data.message);
						window.localStorage.clear();
					}
				})
				.catch((e) => window.localStorage.clear());
		}
	};
	const onFailure = (e) => {
		window.localStorage.clear();
	};
	useEffect(() => {
		getDepartment().then((res) => dispatch(setDept(res.data)));
	}, []);
	return (
		<div className="content">
			<div className="sub_title">
				<p className="tit">글로벌존 서비스 로그인</p>
			</div>
			<div className="login_wrap">
				<p className="tit">Login</p>
				<LoginHeader />
				<div className="gsuite_login">
					{/* <div className="btn"> */}
					{/* {" "} */}
					<GoogleLogin
						clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
						buttonText="Google"
						render={(renderProps) => (
							<div
								className="btn"
								onClick={renderProps.onClick}
								disabled={renderProps.disabled}
							>
								G-suite 계정으로 로그인하기
							</div>
						)}
						onSuccess={onSuccess}
						onFailure={onFailure}
						isSignedIn={true}
					/>
					{/* </div> */}
					<p>@g.yju.ac.kr 로 끝나는 G-suite 계정만 사용이 가능합니다.</p>
				</div>
			</div>
		</div>
	);
};

function LoginHeader() {
	const history = useHistory();
	const location = useLocation();
	return (
		<ul className="tab no2">
			<li
				className={location.pathname === "/student" && "on"}
				onClick={() => {
					history.push("/student");
				}}
			>
				한국인 학생
			</li>
			<li
				className={location.pathname === "/foreigner" && "on"}
				onClick={() => {
					history.push("/foreigner");
				}}
			>
				유학생
			</li>
		</ul>
	);
}

export function AdminLogin() {
	const id = useRef();
	const pw = useRef();

	const [data, setData] = useState();
	const [pending, setPending] = useState(false);

	useEffect(() => {
		if (pending) {
			if (data) {
				if (data.data && data.data.token) {
					window.localStorage.setItem("global-zone-admin-token", data.data.token);
					window.localStorage.setItem("global-zone-loginId", data.data.info.account);
					window.localStorage.setItem("global-zone-loginName", data.data.info.name);
					window.localStorage.setItem("global-zone-userClass", conf.userClass.MANAGER);
					window.localStorage.setItem("global-zone-isLogin", true);

					window.location.replace("/");
				} else {
					document.getElementById("password").innerHTML = data;
					document.getElementById("root").style.display = "none";
				}
			}
		}
		return;
	}, [pending, data]);

	const handleReset = () => {
		postReset().then((res) => process.env.REACT_APP_DEVELOP_MODE && console.log(res));
	};

	const handleLogin = () => {
		const { value: idValue } = id.current;
		const { value: pwValue } = pw.current;
		if (blankValidator(idValue, pwValue));
		// postLoginForeigner({ std_for_id: idValue, password: pwValue }, setData, setPending);
		postAdminLogin({ account: idValue, password: pwValue }).then((res) => {
			setPending(true);
			res.status === 200 && setData(res.data);
		});
	};

	return (
		<div className="content">
			<div className="sub_title">
				<p className="tit">글로벌존 서비스 로그인</p>
			</div>
			<div className="login_wrap">
				<p className="tit">관리자 계정 로그인</p>
				<div className="login_input">
					<input
						onKeyUp={(e) => handleEnterKey(e, handleLogin)}
						type="text"
						name="adminId"
						placeholder="관리자 계정을 입력해주세요."
						ref={id}
					/>
					<input
						onKeyUp={(e) => handleEnterKey(e, handleLogin)}
						type="password"
						name="password"
						placeholder="비밀번호를 입력해주세요."
						ref={pw}
					/>
					<div className="submit" onClick={handleLogin}>
						로그인
					</div>
					<button onClick={handleReset}>비밀번호 초기화</button>
				</div>
			</div>
		</div>
	);
}

export default Login;