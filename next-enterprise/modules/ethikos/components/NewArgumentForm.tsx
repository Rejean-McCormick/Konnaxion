"use client";

import { Form, Input, Radio, Button, message } from "antd";
import { useCreateArgument } from "../hooks/useArguments";

const { TextArea } = Input;

export default function NewArgumentForm({ topicId }: { topicId: string }) {
  const create = useCreateArgument(topicId);

  return (
    <Form
      layout="vertical"
      onFinish={(values) =>
        create.mutate(values, {
          onSuccess: () => {
            message.success("Argument posted");
          },
        })
      }
    >
      <Form.Item name="stance" initialValue="pro">
        <Radio.Group>
          <Radio value="pro">Pro</Radio>
          <Radio value="con">Con</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="body"
        rules={[{ required: true, message: "Argument body required" }]}
      >
        <TextArea rows={4} placeholder="Write your argument…" />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={create.isLoading}>
        Submit
      </Button>
    </Form>
  );
}

