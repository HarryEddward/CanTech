"use client";
import { Steps } from 'rsuite';

export default function OrderStatus() {
  return (
    <Steps current={1} vertical>
      <Steps.Item title="Finished" />
      <Steps.Item title="In progress" />
      <Steps.Item title="Waiting" />
      <Steps.Item title="Waiting" />
    </Steps>
  )
}

