import { Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';

interface SimpleFeedbackProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon: string;
}

export default function SimpleFeedback({ 
  isVisible, 
  onClose, 
  title, 
  message, 
  icon 
}: SimpleFeedbackProps) {
  return (
    <Transition appear show={isVisible} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                
                {/* Header */}
                <Dialog.Title className="flex items-center text-lg font-medium mb-4">
                  <span className="text-2xl mr-3">{icon}</span>
                  {title}
                </Dialog.Title>

                {/* Content */}
                <div className="text-gray-700 leading-relaxed mb-6">
                  {message}
                </div>

                {/* Close Button */}
                <div className="flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Got it!
                  </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}