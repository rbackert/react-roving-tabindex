import React from "react";
import { render, cleanup, fireEvent } from "react-testing-library";
import Provider from "../Provider";
import useRovingTabindex from "../use-roving-tabindex";

afterEach(cleanup);

const TestButton = ({
  disabled,
  children
}: {
  disabled: boolean;
  children: React.ReactNode;
}) => {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [tabIndex, focused, handleKeyDown, handleClick] = useRovingTabindex(
    ref,
    disabled
  );
  return (
    <button
      ref={ref}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      tabIndex={tabIndex}
      data-focused={focused}
    >
      {children}
    </button>
  );
};

const TestToolbar = ({
  flags = [false, false, false]
}: {
  flags?: Array<boolean>;
}) => (
  <Provider>
    <TestButton disabled={flags[0]}>Button One</TestButton>
    <div>
      <TestButton disabled={flags[1]}>Button Two</TestButton>
    </div>
    <TestButton disabled={flags[2]}>Button Three</TestButton>
  </Provider>
);

test("displays correctly initially when no buttons are disabled", async () => {
  const flags = [false, false, false];
  const { getByText } = render(<TestToolbar flags={flags} />);
  expect(getByText("Button One").tabIndex).toEqual(0);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(-1);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );
});

test("displays correctly initially when first button is disabled", async () => {
  const flags = [true, false, false];
  const { getByText } = render(<TestToolbar flags={flags} />);
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button Two").tabIndex).toEqual(0);
  expect(getByText("Button Three").tabIndex).toEqual(-1);
});

test("updates correctly when a button changes to being disabled", async () => {
  let flags = [false, false, false];
  const { getByText, rerender } = render(<TestToolbar flags={flags} />);
  flags = [true, false, false];
  rerender(<TestToolbar flags={flags} />);
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button Two").tabIndex).toEqual(0);
  expect(getByText("Button Three").tabIndex).toEqual(-1);
});

test("pressing arrow right key", async () => {
  const { getByText } = render(<TestToolbar />);

  fireEvent.keyDown(getByText("Button One"), { key: "ArrowRight" });
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").tabIndex).toEqual(0);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("true");
  expect(getByText("Button Three").tabIndex).toEqual(-1);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );

  fireEvent.keyDown(getByText("Button Two"), { key: "ArrowRight" });
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(0);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "true"
  );

  fireEvent.keyDown(getByText("Button Three"), { key: "ArrowRight" });
  expect(getByText("Button One").tabIndex).toEqual(0);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("true");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(-1);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );
});

test("pressing arrow left key", async () => {
  const { getByText } = render(<TestToolbar />);

  fireEvent.keyDown(getByText("Button One"), { key: "ArrowLeft" });
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(0);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "true"
  );

  fireEvent.keyDown(getByText("Button Three"), { key: "ArrowLeft" });
  expect(getByText("Button One").tabIndex).toEqual(-1);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").tabIndex).toEqual(0);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("true");
  expect(getByText("Button Three").tabIndex).toEqual(-1);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );

  fireEvent.keyDown(getByText("Button Two"), { key: "ArrowLeft" });
  expect(getByText("Button One").tabIndex).toEqual(0);
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("true");
  expect(getByText("Button Two").tabIndex).toEqual(-1);
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").tabIndex).toEqual(-1);
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );
});

test("manages focus when switching between keyboard and mouse input", async () => {
  const flags = [false, false, false];
  const { getByText } = render(<TestToolbar flags={flags} />);

  fireEvent.mouseDown(getByText("Button One"));
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );

  fireEvent.keyDown(getByText("Button One"), { key: "ArrowRight" });
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("true");
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );

  fireEvent.click(getByText("Button One"));
  expect(getByText("Button One").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Two").getAttribute("data-focused")).toEqual("false");
  expect(getByText("Button Three").getAttribute("data-focused")).toEqual(
    "false"
  );
});