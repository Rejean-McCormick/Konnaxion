'use client'

/**
 * KeenKonnect · Knowledge · Document Management
 *
 * Static, typed demo page showing:
 * - document content
 * - editable panel
 * - metadata
 * - version history
 * - comments thread
 *
 * Layout is handled by app/keenkonnect/layout.tsx (MainLayout),
 * so this page only renders its own content.
 */

import React, { useState } from 'react'
import Head from 'next/head'
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Timeline,
  Divider,
  List,
  Avatar,
  message as antdMessage,
} from 'antd'
import { SaveOutlined, UploadOutlined, EditOutlined } from '@ant-design/icons'
import { Comment } from '@ant-design/compatible'

const { TextArea } = Input

type VersionItem = {
  key: string
  time: string
  event: string
}

type CommentItem = {
  author: string
  avatar: string
  content: React.ReactNode
  datetime: string
}

const documentMetadata = {
  title: 'Innovative Research Document',
  createdAt: '2023-08-01',
  lastModified: '2023-09-05',
  version: '2.0',
  language: 'English',
}

const versionHistory: VersionItem[] = [
  { key: '1', time: '2023-08-05', event: 'Version 1.0 created by Alice' },
  { key: '2', time: '2023-08-20', event: 'Version 1.5 updated by Bob' },
  { key: '3', time: '2023-09-05', event: 'Version 2.0 published by Alice' },
]

const commentsData: CommentItem[] = [
  {
    author: 'John',
    avatar: '/avatars/john.png',
    content: <p>Great improvements in this version!</p>,
    datetime: '2023-09-06 09:15',
  },
  {
    author: 'Emma',
    avatar: '/avatars/emma.png',
    content: <p>I suggest adding more details in the methodology section.</p>,
    datetime: '2023-09-06 10:20',
  },
]

export default function DocumentManagementPage(): JSX.Element {
  const userCanEdit = true

  const [documentContent, setDocumentContent] = useState<string>(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum pretium, risus at fermentum cursus, purus lacus scelerisque dolor, nec dictum augue mi ut ligula. Sed vitae nisl vel metus tincidunt interdum.',
  )

  const handleSaveChanges = () => {
    // Simulate an API call
    // In real usage, replace with your mutation:
    // await api.patch('/knowledge/documents/:id', { content: documentContent })
    // eslint-disable-next-line no-console
    console.log('Saving changes:', documentContent)
    antdMessage.success('Changes saved successfully.')
  }

  const handlePublishNewVersion = () => {
    // Simulate publish
    // eslint-disable-next-line no-console
    console.log('Publishing new version…')
    antdMessage.success('New version published successfully.')
  }

  return (
    <>
      <Head>
        <title>Document Management</title>
        <meta
          name="description"
          content="Manage and edit your knowledge documents, view version history, and collaborate with reviewers."
        />
      </Head>

      <div className="container mx-auto p-5">
        {/* Page Header */}
        <h1 className="text-2xl font-bold mb-4">Document Management</h1>

        <Row gutter={16}>
          {/* Left Panel: Content Viewer */}
          <Col xs={24} md={14}>
            <Card title="Document Content" style={{ height: '100%', overflowY: 'auto' }}>
              <div style={{ padding: 20 }}>
                <p>{documentContent}</p>
              </div>
            </Card>
          </Col>

          {/* Right Panel: Editor, Metadata, Version History & Comments */}
          <Col xs={24} md={10}>
            {/* Editor Panel (if editable) */}
            <Card
              title={userCanEdit ? 'Edit Document' : 'Document Details'}
              extra={
                userCanEdit ? (
                  <Button icon={<EditOutlined />} onClick={() => {}}>
                    Edit
                  </Button>
                ) : null
              }
              className="mb-4"
            >
              {userCanEdit ? (
                <>
                  <TextArea
                    rows={10}
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                  />
                  <Divider />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSaveChanges}
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="default"
                      icon={<UploadOutlined />}
                      onClick={handlePublishNewVersion}
                    >
                      Publish New Version
                    </Button>
                  </div>
                </>
              ) : (
                <p>{documentContent}</p>
              )}
            </Card>

            {/* Metadata Sidebar */}
            <Card title="Document Metadata" className="mb-4">
              <p>
                <strong>Title:</strong> {documentMetadata.title}
              </p>
              <p>
                <strong>Created At:</strong> {documentMetadata.createdAt}
              </p>
              <p>
                <strong>Last Modified:</strong> {documentMetadata.lastModified}
              </p>
              <p>
                <strong>Version:</strong> {documentMetadata.version}
              </p>
              <p>
                <strong>Language:</strong> {documentMetadata.language}
              </p>
            </Card>

            {/* Version History */}
            <Card title="Version History" className="mb-4">
              <Timeline>
                {versionHistory.map((version) => (
                  <Timeline.Item key={version.key}>
                    <strong>{version.time}</strong> - {version.event}
                  </Timeline.Item>
                ))}
              </Timeline>
              <Button type="link">Compare / Restore Versions</Button>
            </Card>

            {/* Comments / Collaboration Thread */}
            <Card title="Comments" className="mb-4">
              <List
                itemLayout="horizontal"
                dataSource={commentsData}
                renderItem={(comment) => (
                  <Comment
                    author={comment.author}
                    avatar={<Avatar src={comment.avatar} />}
                    content={comment.content}
                    datetime={comment.datetime}
                  />
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </>
  )
}
