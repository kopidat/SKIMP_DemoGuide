package mcore.edu.demoGuide.common;

public class Const {

    /**
     * 글로벌 로그 TAG
     */
    public static final String GLOBAL_LOG_TAG = "KDS";

    /**
     * 인터페이스 콜백 성공 실패 여부
     */
    public static final String YES = "YES";
    public static final String NO = "NO";
    public static final String NO_DONT_ASK = "NO_DONT_ASK"; // 퍼미션 허용 체크 시 '다시 묻지 않기'를 체크 후 거절하였을 경우
    public static final String SUCCESS = "SUCCESS";
    public static final String FAIL = "FAIL";
    public static final String CANCEL = "CANCEL";

    /**
     * 인터페이스 자바스크립트 콜백 리턴 아이디
     */
    public static String JS_PinAuthManager = "";
    public static String JS_PatternAuthManager = "";

    /**
     * Request Code
     */
    public static final int REQ_AUTH_PIN = 1002;
    public static final int REQ_AUTH_PATTERN = 1003;
    public static final int REQ_AUTH_PIN_GET = 1004;

}
