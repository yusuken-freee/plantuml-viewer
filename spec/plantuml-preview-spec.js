/* global atom jasmine beforeEach waitsForPromise runs describe it expect */
'use strict'

var temp = require('temp')
var path = require('path')
var wrench = require('wrench')

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

var FIXTURES_PATH = path.join(__dirname, 'fixtures')

temp.track()

describe('PlantumlPreview', function () {
  var activationPromise
  var workspaceElement

  beforeEach(function () {
    var tempPath = temp.mkdirSync('plantuml-preview')
    wrench.copyDirSyncRecursive(FIXTURES_PATH, tempPath, { forceDelete: true })
    atom.project.setPaths([tempPath])

    workspaceElement = atom.views.getView(atom.workspace)
    activationPromise = atom.packages.activatePackage('plantuml-preview')

    waitsForPromise(function () {
      return atom.packages.activatePackage('language-plantuml')
    })
  })

  describe('when the plantuml-preview:toggle event is triggered', function () {
    it('hides and shows the modal panel', function () {
      waitsForPromise(function () {
        return atom.workspace.open('file.puml')
      })

      runs(function () {
        // Before the activation event the view is not on the DOM, and no panel
        // has been created
        expect(workspaceElement.querySelector('.plantuml-preview')).not.toExist()

        // This is an activation event, triggering it will cause the package to be
        // activated.
        atom.commands.dispatch(workspaceElement, 'plantuml-preview:toggle')
      })

      waitsForPromise(function () {
        return activationPromise
      })

      runs(function () {
        expect(workspaceElement.querySelector('.plantuml-preview')).toExist()

        var plantumlPreviewElement = workspaceElement.querySelector('.plantuml-preview')
        expect(plantumlPreviewElement).toExist()

        var plantumlPreviewPanel = atom.workspace.panelForItem(plantumlPreviewElement)
        expect(plantumlPreviewPanel.isVisible()).toBe(true)
        atom.commands.dispatch(workspaceElement, 'plantuml-preview:toggle')
        expect(plantumlPreviewPanel.isVisible()).toBe(false)
      })
    })

    it('hides and shows the view', function () {
      // This test shows you an integration test testing at the view level.

      waitsForPromise(function () {
        return atom.workspace.open('file.puml')
      })

      runs(function () {
        // Attaching the workspaceElement to the DOM is required to allow the
        // `toBeVisible()` matchers to work. Anything testing visibility or focus
        // requires that the workspaceElement is on the DOM. Tests that attach the
        // workspaceElement to the DOM are generally slower than those off DOM.
        jasmine.attachToDOM(workspaceElement)

        expect(workspaceElement.querySelector('.plantuml-preview')).not.toExist()

        // This is an activation event, triggering it causes the package to be
        // activated.
        atom.commands.dispatch(workspaceElement, 'plantuml-preview:toggle')
      })

      waitsForPromise(function () {
        return activationPromise
      })

      runs(function () {
        // Now we can test for view visibility
        var plantumlPreviewElement = workspaceElement.querySelector('.plantuml-preview')
        expect(plantumlPreviewElement).toBeVisible()
        atom.commands.dispatch(workspaceElement, 'plantuml-preview:toggle')
        expect(plantumlPreviewElement).not.toBeVisible()
      })
    })
  })
})
