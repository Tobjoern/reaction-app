import React from 'react';
import { Button, Modal, Form, Select, Input, Checkbox } from 'antd'

const Option = Select.Option;


function CreateModal(props) {
    const { onHide, onSubmit, isVisible, isLoading } = props;

    const handleSubmit = (e) => {
        e.preventDefault();
        props.form.validateFields((err, values) => {
            if (!err) {
                onSubmit(values);
            }
        });
    };

    const { getFieldDecorator } = props.form;

    const bestOfOptions = [1, 3, 5, 9, 15];

    return (
        <div>
            <Modal
                title="Create Game"
                visible={isVisible}
                onCancel={onHide}
                footer={[
                    <Button key="back" onClick={onHide}>
                        Cancel
                    </Button>,
                    <Button type="primary" loading={isLoading} form="gameForm" key="submit" htmlType="submit">
                        Create
                    </Button>,
                ]}
            >
                <Form onSubmit={handleSubmit} id="gameForm">
                    <Form.Item label="Username">
                        {getFieldDecorator('username', {
                            rules: [
                                { required: true, message: 'Please input your username!' },
                                { maxLength: 40, message: 'Max Lenght is 40!' }
                            ]
                        })(<Input placeholder="Username" />)}
                    </Form.Item>

                    <Form.Item label="Best of">
                        {getFieldDecorator('gameType', {
                            rules: [{ required: true, message: 'Please input the game type!' }]
                        })(
                            <Select initialValue={3}>
                                {bestOfOptions.map((o, i) => {
                                    return (
                                        <Option key={i} value={o}>
                                            {o}
                                        </Option>
                                    );
                                })}
                            </Select>
                        )}
                    </Form.Item>

                    <Form.Item>
                        {getFieldDecorator('isPublic', {
                            valuePropName: 'checked',
                            initialValue: true,
                        })(<Checkbox>Is Public</Checkbox>)}
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    )
}

export default Form.create({ name: 'game' })(CreateModal);
