import {ajaxDelete, AjaxError, AjaxObservable, ajaxPost, ajaxPut, AjaxResponse,} from "rxjs/internal-compatibility";
import URITemplate from "urijs/src/URITemplate";
import URI from "urijs";
import {of, throwError} from "rxjs";
import {catchError, map, switchMap} from "rxjs/operators";

export interface IHttpOptions {
  params?: { [key: string]: string };
  queryParams?: { [key: string]: any };
  headers?: { [key: string]: string };
  responseType?: string;
  disableAuth?: boolean;
}

const globalErrorHandler = (error: AjaxError) => {
  return throwError(error);
};

const graphQlErrorMapper = (response: AjaxResponse) => {
  if (response.response.errors && response.response.errors.length > 0) {
    const firstError = response.response.errors[0];
    throw {
      status: firstError.extensions ? firstError.extensions.code : "",
      response: {
        overrideMessage: firstError.message,
      },
      xhr: response.xhr,
    };
  }
  return response;
};

class HttpClient {
  public getDefaultHeaders(options: IHttpOptions) {
    return of({
      "Content-Type": "application/json",
    });
  }

  public get(url: string, options: IHttpOptions = {}) {
    return this.getDefaultHeaders(options).pipe(
      switchMap((headers) =>
        new AjaxObservable<AjaxResponse>({
          method: "GET",
          url: this.transformUri(url, options),
          responseType: options.responseType || "json",
          headers: {...headers, ...(options.headers || {})},
        }).pipe(catchError(globalErrorHandler)),
      ),
    );
  }

  public post(url: string, body?: any, options: IHttpOptions = {}) {
    return this.getDefaultHeaders(options).pipe(
      switchMap((headers) =>
        ajaxPost(this.transformUri(url, options), body, {
          ...headers,
          ...(options.headers || {}),
        }).pipe(catchError(globalErrorHandler)),
      ),
    );
  }

  public postGraphQl(url: string, body?: any, options: IHttpOptions = {}) {
    return this.getDefaultHeaders(options).pipe(
      switchMap((headers) =>
        ajaxPost(this.transformUri(url, options), this.transformBody(body), {
          ...headers,
          ...(options.headers || {}),
        })
          .pipe(catchError(globalErrorHandler))
          .pipe(map(graphQlErrorMapper)),
      ),
    );
  }

  public delete(url: string, options: IHttpOptions = {}) {
    return this.getDefaultHeaders(options).pipe(
      switchMap((headers) =>
        ajaxDelete(this.transformUri(url, options), {
          ...headers,
          ...(options.headers || {}),
        }).pipe(catchError(globalErrorHandler)),
      ),
    );
  }

  public put(url: string, body?: any, options: IHttpOptions = {}) {
    return this.getDefaultHeaders(options).pipe(
      switchMap((headers) =>
        ajaxPut(this.transformUri(url, options), body, {
          ...headers,
          ...(options.headers || {}),
        }).pipe(catchError(globalErrorHandler)),
      ),
    );
  }

  public transformUri(url: string, uriSpecs: IHttpOptions = {}): string {
    const parsed = URI(
      URITemplate(url)
        .expand({
          ...uriSpecs.params,
        })
        .valueOf(),
    );

    return parsed
      .search({
        ...parsed.search(true),
        ...(uriSpecs.queryParams || {}),
      })
      .valueOf();
  }

  public transformBody(body: any) {
    const variables = {
      ...body.variables,
    };
    return {
      ...body,
      variables,
    };
  }
}

export const httpClient = new HttpClient();
