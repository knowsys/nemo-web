import { useContext, useEffect } from "react";
import { NemoSessionIdContext } from "./nemoSessionIdContext";

let singletonNevChannel: BroadcastChannel | undefined = undefined;

function initChannel() {
  if (!singletonNevChannel) {
    singletonNevChannel = new BroadcastChannel("NemoVisualization");
  }
}

export type NevBroadcastChannelHandler<RequestPayload, ResponsePayload> = (
  payload: RequestPayload,
) => Promise<ResponsePayload>;
type CloseCallback = () => void;

function addNevListener<RequestPayload, ResponsePayload>(
  nemoSessionId: string,
  eventName: string,
  handler: NevBroadcastChannelHandler<RequestPayload, ResponsePayload>,
): CloseCallback {
  // create connection to channel if none exist yet
  // NOTE: We never close the connection since there is no sensible time to do so.
  // During normal operations, once reasoning has been performed, there will always be listeners on the channel.
  initChannel();
  const bc = singletonNevChannel!;

  const onMessage = async (event: MessageEvent) => {
    // Don't listen on own messages (which might be filtered by default by the channel, I did not check this...).
    if (!!event.data.error || !!event.data.responseType) {
      return;
    }

    // Ignore messages that are not meant for this nemo session.
    if (event.data.nemoId !== nemoSessionId) {
      return;
    }

    const id = event.data.id;

    if (!event.data.queryType || !event.data.payload) {
      bc.postMessage({
        nemoId: nemoSessionId,
        id,
        error: "Expected an object with queryType and payload.",
      });
      return;
    }

    const { queryType, payload } = event.data; // data should consist of queryType and payload

    // ignore everything but the target eventName
    if (queryType !== eventName) {
      return;
    }

    try {
      const response = await handler(payload);
      // if the handler has a proper response, then we send the response
      // (some handler might just perform an action and don't respond)
      if (response !== undefined) {
        bc.postMessage({
          nemoId: nemoSessionId,
          id,
          responseType: eventName,
          payload: response,
        });
      }
    } catch (error) {
      console.error(error);
      bc.postMessage({
        nemoId: nemoSessionId,
        id,
        error,
      });
    }
  };

  bc.addEventListener("message", onMessage);

  return () => {
    bc.removeEventListener("message", onMessage);
  };
}

export function useNevBroadcastChannelListener<RequestPayload, ResponsePayload>(
  eventName: string,
  handler: NevBroadcastChannelHandler<RequestPayload, ResponsePayload>,
) {
  const nemoSessionId = useContext(NemoSessionIdContext);

  useEffect(() => {
    const removeListener = addNevListener(nemoSessionId, eventName, handler);

    return () => removeListener();
  }, [nemoSessionId, eventName, handler]);
}
