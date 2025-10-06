import httpZac from 'virtual:http-zac'

export class TestInputController {
  testNamedQuery(...args) {
    return httpZac({
      method: 'GET',
      path: 'query/named',
      parameters: [
        {
          name: '_page',
          decorator: 'Query',
          key: 'page',
        },
        {
          name: '_limit',
          decorator: 'Query',
          key: 'limit',
        },
      ],
    }, args)
  }

  testQueryObject(...args) {
    return httpZac({
      method: 'GET',
      path: 'query/object',
      parameters: [
        {
          name: '_query',
          decorator: 'Query',
        },
      ],
    }, args)
  }

  testNamedParam(...args) {
    return httpZac({
      method: 'GET',
      path: 'param/named/:userId/:postId',
      parameters: [
        {
          name: '_userId',
          decorator: 'Param',
          key: 'userId',
        },
        {
          name: '_postId',
          decorator: 'Param',
          key: 'postId',
        },
      ],
    }, args)
  }

  testParamObject(...args) {
    return httpZac({
      method: 'GET',
      path: 'param/object/:type/:id/:action',
      parameters: [
        {
          name: '_params',
          decorator: 'Param',
        },
      ],
    }, args)
  }

  testMixedParam(...args) {
    return httpZac({
      method: 'GET',
      path: 'param/mixed/:userId/:postId',
      parameters: [
        {
          name: '_userId',
          decorator: 'Param',
          key: 'userId',
        },
        {
          name: '_allParams',
          decorator: 'Param',
        },
      ],
    }, args)
  }

  testHeaders(...args) {
    return httpZac({
      method: 'GET',
      path: 'headers',
      parameters: [
        {
          name: '_auth',
          decorator: 'Headers',
          key: 'authorization',
        },
        {
          name: '_headers',
          decorator: 'Headers',
        },
      ],
    }, args)
  }

  testSingleFileUpload(...args) {
    return httpZac({
      method: 'POST',
      path: 'upload/single',
      parameters: [
        {
          name: '_file',
          decorator: 'UploadedFile',
          fileInfo: {
            uploadType: 'single',
            fileFields: [
              {
                fieldName: 'file',
                isArray: false,
              },
            ],
          },
        },
        {
          name: '_metadata',
          decorator: 'Body',
        },
      ],
      fileUpload: {
        type: 'single',
        fieldNames: [
          'file',
        ],
      },
    }, args)
  }

  testMultipleFileUpload(...args) {
    return httpZac({
      method: 'POST',
      path: 'upload/multiple',
      parameters: [
        {
          name: '_files',
          decorator: 'UploadedFiles',
          fileInfo: {
            uploadType: 'multiple',
            fileFields: [
              {
                fieldName: 'files',
                isArray: true,
                maxCount: 5,
              },
            ],
          },
        },
        {
          name: '_metadata',
          decorator: 'Body',
        },
      ],
      fileUpload: {
        type: 'multiple',
        fieldNames: [
          'files',
        ],
        maxCount: 5,
      },
    }, args)
  }

  testNamedMultipleFileUpload(...args) {
    return httpZac({
      method: 'POST',
      path: 'upload/named-multiple',
      parameters: [
        {
          name: '_files',
          decorator: 'UploadedFiles',
          fileInfo: {
            uploadType: 'named-multiple',
            fileFields: [
              {
                fieldName: 'documents',
                isArray: true,
                maxCount: 3,
              },
              {
                fieldName: 'images',
                isArray: true,
                maxCount: 2,
              },
            ],
          },
        },
        {
          name: '_metadata',
          decorator: 'Body',
        },
      ],
      fileUpload: {
        type: 'named-multiple',
        fieldNames: [
          'documents',
          'images',
        ],
        details: {
          documents: {
            maxCount: 3,
          },
          images: {
            maxCount: 2,
          },
        },
      },
    }, args)
  }

  testResponseContext(...args) {
    return httpZac({
      method: 'GET',
      path: 'context/response',
      parameters: [
        {
          name: '_response',
          decorator: 'Res',
        },
      ],
    }, args)
  }

  testComplex(...args) {
    return httpZac({
      method: 'PUT',
      path: 'complex/:id',
      parameters: [
        {
          name: '_id',
          decorator: 'Param',
          key: 'id',
        },
        {
          name: '_body',
          decorator: 'Body',
        },
        {
          name: '_version',
          decorator: 'Query',
          key: 'version',
        },
        {
          name: '_auth',
          decorator: 'Headers',
          key: 'authorization',
        },
        {
          name: '_request',
          decorator: 'Req',
        },
      ],
    }, args)
  }

  testDeleteMethod(...args) {
    return httpZac({
      method: 'DELETE',
      path: 'methods/delete/:id',
      parameters: [
        {
          name: '_id',
          decorator: 'Param',
          key: 'id',
        },
      ],
    }, args)
  }

  testEdgeCases(...args) {
    return httpZac({
      method: 'GET',
      path: 'edge',
      parameters: [
        {
          name: '_page',
          decorator: 'Query',
          key: 'page',
        },
        {
          name: '_auth',
          decorator: 'Headers',
          key: 'authorization',
        },
        {
          name: '_response',
          decorator: 'Res',
        },
      ],
    }, args)
  }
}
