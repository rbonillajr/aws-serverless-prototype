import {assert} from "chai";
import {AuthValidationService} from "../../../../../domain/auth/AuthValidationService";

/**
 * AuthValidationService.issueAuthorizationCodeValidateのテスト
 */
describe("IssueAuthorizationCodeValidate", () => {

  /**
   * バリデーションテスト
   * 必須パラメータが設定されていない
   */
  it("testValidationUnsetRequiredParams", () => {
    const requests = [
      {foo: "bar"}
    ];

    requests.map((request) => {
      const validateResultObject = AuthValidationService.issueAuthorizationCodeValidate(request);

      assert.property(
        validateResultObject,
        "client_id"
      );

      assert.property(
        validateResultObject,
        "state"
      );

      assert.property(
        validateResultObject,
        "redirect_uri"
      );

      assert.property(
        validateResultObject,
        "subject"
      );

      assert.property(
        validateResultObject,
        "scopes"
      );

      // 許可していないキーが指定された場合もエラー情報としてレスポンスに含まれる
      assert.property(
        validateResultObject,
        "foo"
      );
    });
  });

  /**
   * バリデーションテスト
   * パラメータの指定は行うが、各値にはバリデーションが通らない値を指定
   */
  it("testValidationSetParams", () => {
    const requests = [
      {
        // 許可されている最小値より小さい値を指定
        client_id: 0,
        // 許可されている最小値より小さい値を指定
        state: "1234567",
        // 不正なURLフォーマットを指定
        redirect_uri: "url",
        // 許可されている最大値より大きい値を指定
        subject: "98f46ad0-09e2-4324-910c-011df62e73071",
        // 許可されている最小値より小さい値を指定
        scopes: ["food"]
      },
      {
        // 許可されている最大値より大きい値を指定
        client_id: 9999999999999,
        // 数値型を指定
        state: 12345678,
        // 不正なURLフォーマットを指定
        redirect_uri: "http",
        // 許可されている最小値より小さい値を指定
        subject: "98f46ad0-09e2-4324-910c-011df62e730",
        // 許可されている最大値より大きい値を指定
        scopes: ["98f46ad0-09e2-4324-910c-011df62e7"]
      },
      {
        // nullを指定
        client_id: null,
        state: null,
        redirect_uri: null,
        subject: null,
        scopes: [null]
      }
    ];

    requests.map((request) => {
      const validateResultObject = AuthValidationService.issueAuthorizationCodeValidate(request);
      assert.property(
        validateResultObject,
        "client_id"
      );

      assert.property(
        validateResultObject,
        "state"
      );

      assert.property(
        validateResultObject,
        "redirect_uri"
      );

      assert.property(
        validateResultObject,
        "subject"
      );

      assert.property(
        validateResultObject,
        "scopes[0]"
      );
    });
  });
});
