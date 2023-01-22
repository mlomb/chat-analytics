/**
 * @jest-environment jsdom
 */
import { plausible } from "@assets/Plausible";

const testPageview = ({ location, expectedPath }: { location: string; expectedPath: string }) => {
    const fetchMock = (global.fetch = jest.fn() as jest.Mock);

    // The URL object has a lot of the same functionality as the Location object
    // we can use it to test
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    global.location = new URL(location);

    plausible("pageview");

    const fetchBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(fetchBody.url).toBe(`https://chatanalytics.app${expectedPath}`);
};

it.each([
    { expectedPath: "", location: "https://chatanalytics.app" },
    { expectedPath: "", location: "https://chatanalytics.app/" },
    { expectedPath: "/demo", location: "https://chatanalytics.app/demo" },
    { expectedPath: "/report", location: "https://chatanalytics.app/1bce0f51-c722-4a6b-9957-5588a601366c" },
    { expectedPath: "/report", location: "blob:https://chatanalytics.app/1bce0f51-c722-4a6b-9957-5588a601366c" },
    { expectedPath: "/report", location: "http://someuser.github.io" },
    { expectedPath: "/report", location: "http://someuser.github.io/Report - Chat Analytics.html" },
    { expectedPath: "/report", location: "http://someuser.github.io/somereport" },
    { expectedPath: "/report", location: "http://someuser.github.io/somereport/Report - Chat Analytics.html" },
    { expectedPath: "/report", location: "file:///C:/Users/user/Downloads/Report - Chat Analytics.html" },
    { expectedPath: "/report", location: "http://127.0.0.1:8080" },
    { expectedPath: "/report", location: "http://127.0.0.1:8080/Report - Chat Analytics.html" },
])("should resolve in path '$expectedPath': $location", testPageview);

it.each([
    {
        location: "https://chatanalytics.app/?utm_source=report",
        expectedPath: "?utm_source=report",
    },
    {
        location: "https://chatanalytics.app/demo/?utm_source=facebook",
        expectedPath: "/demo?utm_source=facebook",
    },
    {
        location: "http://someuser.github.io/somereport/?utm_source=twitter",
        expectedPath: "/report?utm_source=twitter",
    },
])("should preserve search params: $location", testPageview);
