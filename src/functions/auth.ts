import * as sourceMapSupport from "source-map-support";
import * as lambda from "aws-lambda";
import {LambdaExecutionEvent} from "../../types";
import {AccessTokenRepository} from "../repositories/access-token-repository";
import {AccessTokenEntity} from "../domain/auth/access-token-entity";

sourceMapSupport.install();

/**
 * 認可を行う
 * 一部の例外を除き全てのAPIリクエストはこの関数で認可を行う
 *
 * @param event
 * @param context
 * @param callback
 */
export const authorization = (event: LambdaExecutionEvent, context: lambda.Context, callback: lambda.Callback): void => {

  // TODO ロジックは後で適切な形で分離する @keita-nishimoto
  const authorizationHeader = event.authorizationToken;
  const accessToken = extractAccessToken(authorizationHeader);

  if (accessToken === "") {
    callback(new Error("Unauthorized"));
  }

  // TODO 仮実装。後で本格的な実装を行う。 @keita-nishimoto
  let effect = "";
  switch (accessToken) {
    case "allow":
      effect = "Allow";
      break;
    case "deny":
      effect = "Deny";
      break;
    case "error":
      callback(new Error("Internal Server Error"));
      break;
    default:
      effect = "Allow";
      break;
  }

  const accessTokenRepository = new AccessTokenRepository();

  accessTokenRepository.fetch(accessToken)
    .then((accessTokenEntity) => {
      const authResponse = generatePolicy(
        "user",
        effect,
        event.methodArn
      );

      callback(null, authResponse);
    })
    .catch((error) => {
      callback(error);
    });

  /*
  introspect(accessToken)
    .then((accessTokenEntity: AccessTokenEntity) => {
      console.log(accessTokenEntity);

      const authResponse = generatePolicy(
        accessTokenEntity.token,
        effect,
        event.methodArn
      );

      console.log(authResponse);

      callback(null, authResponse);
    })
    .catch((error) => {
      callback(error);
    });
    */
};

/**
 * AuthorizationHeaderからアクセストークンを取り出す
 *
 * @param authorizationHeader
 * @returns {string}
 */
const extractAccessToken = (authorizationHeader: string): string => {

  if (authorizationHeader == null) {
    return "";
  }

  const BEARER_TOKEN_PATTERN = /^Bearer[ ]+([^ ]+)[ ]*$/i;

  const result = BEARER_TOKEN_PATTERN.exec(authorizationHeader);

  if (result === null) {
    return "";
  }

  const accessToken = result[1];

  return accessToken;
};

/**
 * AuthleteのイントロスペクションAPIからアクセストークンを取得する
 *
 * @param accessToken
 * @returns {Promise<AccessTokenEntity>}
 */

/*
const introspect = (accessToken: string): Promise<AccessTokenEntity> => {
  const accessTokenRepository = new AccessTokenRepository();

  return accessTokenRepository.fetch(accessToken);
};
*/

/**
 * API Gatewayに返すポリシーを生成する
 *
 * @param principalId
 * @param effect
 * @param resource
 * @returns {{principalId: string, policyDocument: {}}}
 */
const generatePolicy = (principalId, effect, resource): any => {
  const authResponse = {
    principalId: "",
    policyDocument: {}
  };
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {
      Version: "2012-10-17",
      Statement: []
    };

    const statementOne = {
      Action: "execute-api:Invoke",
      Effect: "",
      Resource: ""
    };

    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
};
