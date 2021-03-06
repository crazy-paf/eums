'use strict';


angular.module('DistributionPlan', ['Contact', 'eums.config', 'DistributionPlanNode', 'ngTable', 'siTable', 'Programme', 'SalesOrderItem'])
    .controller('DistributionPlanController', function ($scope, ContactService, $location, DistributionPlanService, DistributionPlanNodeService, DistributionPlanParameters, ProgrammeService) {
        $scope.contact = {};
        $scope.errorMessage = '';
        $scope.planId = '';

        $scope.distribution_plans = [];
        $scope.distribution_plan_details = [];

        $scope.salesOrders = [];
        $scope.selectedSalesOrders = [];

        $scope.initialize = function () {
            DistributionPlanService.getSalesOrders().then(function (response) {
                $scope.salesOrders = response.data;
                DistributionPlanParameters.saveVariable('salesOrders', $scope.salesOrders);
            });

            DistributionPlanService.fetchPlans().then(function (response) {
                var distributionPlans = response.data;
                distributionPlans.forEach(function (distributionPlan) {
                    ProgrammeService.getProgramme(distributionPlan.programme).then(function (result) {
                        distributionPlan.programme = result;
                    });
                    return distributionPlan;
                });
                $scope.distribution_plans = distributionPlans;
            });
        };

        $scope.newDistributionPlan = function () {
            $location.path('/distribution-plan/new/');
        };

        $scope.showDistributionPlan = function (planId) {
            $scope.planId = planId;

            DistributionPlanService.getPlanDetails(planId).then(function (response) {
                console.log(response);
            });
        };

        $scope.addContact = function () {
            ContactService.addContact($scope.contact).then(function () {
                $location.path('/');
            }, function (error) {
                $scope.errorMessage = error.data.error;
            });
        };
    }).controller('NewDistributionPlanController', function ($scope, ContactService, DistributionPlanParameters, ProgrammeService, SalesOrderItemService, $location) {
        $scope.salesOrders = [];
        $scope.selectedSalesOrders = [];
        $scope.programmeName = '';
        $scope.date = '';
        $scope.programmeSelected = {name: ''};
        $scope.consigneeSelected = {name: ''};

        function retrieveScopeVariables() {
            $scope.selectedSalesOrders = DistributionPlanParameters.retrieveVariable('selectedSalesOrders');
            $scope.programmeName = DistributionPlanParameters.retrieveVariable('programmeName');
            $scope.date = DistributionPlanParameters.retrieveVariable('date');
            $scope.programmeSelected = DistributionPlanParameters.retrieveVariable('programmeSelected');
            $scope.consigneeSelected = DistributionPlanParameters.retrieveVariable('consigneeSelected');
        }

        $scope.initialize = function () {
            $scope.salesOrders = DistributionPlanParameters.retrieveVariable('salesOrders');

            if (DistributionPlanParameters.retrieveVariable('isProceeding')) {
                retrieveScopeVariables();
                var salesOrderItems = [];

                $scope.selectedSalesOrders.forEach(function (selectedOrder) {
                    var orderNumber = selectedOrder.order_number;
                    selectedOrder.salesorderitem_set.forEach(function (salesOrderItem) {
                        var salesOrderItemInformation = [];
                        SalesOrderItemService.getSalesOrderItem(salesOrderItem).then(function (result) {
                            salesOrderItemInformation = result;
                        });
                        salesOrderItems.push({salesOrder: orderNumber, item: salesOrderItemInformation});
                    });
                });

                $scope.salesOrderItems = salesOrderItems;
            }
            else {
                ProgrammeService.fetchProgrammes().then(function (response) {
                    $scope.programmes = response.data;
                });
            }
        };

        $scope.setSupplyPlan = function () {

        };

        $scope.isChecked = function (salesOrder) {
            var indexOfSalesOrder = $scope.selectedSalesOrders.indexOf(salesOrder);
            if (indexOfSalesOrder !== -1) {
                $scope.selectedSalesOrders.splice(indexOfSalesOrder, 1);
            }
            else {
                $scope.selectedSalesOrders.push(salesOrder);
            }
        };

        $scope.selectItems = function () {
            DistributionPlanParameters.saveVariable('selectedSalesOrders', $scope.selectedSalesOrders);
            DistributionPlanParameters.saveVariable('isProceeding', true);
            DistributionPlanParameters.saveVariable('programmeName', $scope.programmeName);
            DistributionPlanParameters.saveVariable('date', $scope.date);
            DistributionPlanParameters.saveVariable('programmeSelected', $scope.programmeSelected);
            DistributionPlanParameters.saveVariable('consigneeSelected', $scope.consigneeSelected);
            $location.path('/distribution-plan/proceed/');
        };
    })
    .factory('DistributionPlanService', function ($http, $q, EumsConfig, DistributionPlanNodeService) {
        var fillOutNode = function (nodeId, plan) {
            return DistributionPlanNodeService.getPlanNodeDetails(nodeId)
                .then(function (nodeDetails) {
                    plan.nodeList.push(nodeDetails);
                });
        };

        var buildNodeTree = function (plan) {
            var rootNode = plan.nodeList.filter(function (node) {
                return node.parent === null;
            })[0];

            if (rootNode) {
                plan.nodeTree = addChildrenDetail(rootNode, plan);
                delete plan.nodeList;
            }
        };

        var addChildrenDetail = function (node, plan) {
            if (node) {
                node.temporaryChildrenList = [];
                node.children.forEach(function (childNodeId) {
                    var descendant = findDetailedNode(childNodeId, plan);
                    node.temporaryChildrenList.push(descendant);
                    addChildrenDetail(descendant, plan);
                });
                node.children = node.temporaryChildrenList;
                delete node.temporaryChildrenList;
                return node;
            }
        };

        var findDetailedNode = function (nodeId, plan) {
            return plan.nodeList.filter(function (node) {
                return node.id === nodeId;
            })[0];
        };

        return {
            fetchPlans: function () {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN);
            },
            getSalesOrders: function () {
                return $http.get(EumsConfig.BACKEND_URLS.SALES_ORDER);

            },
            getPlanDetails: function (planId) {
                var getPlanPromise = $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN + planId + '/');
                return getPlanPromise.then(function (response) {
                    var plan = response.data;
                    var nodeFillOutPromises = [];

                    plan.nodeList = [];
                    plan.distributionplannode_set.forEach(function (nodeId) {
                        nodeFillOutPromises.push(fillOutNode(nodeId, plan));
                    });

                    return $q.all(nodeFillOutPromises).then(function () {
                        buildNodeTree(plan);
                        return plan;
                    });
                });
            },
            createPlan: function (planDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN, planDetails).then(function (response) {
                    if (response.status === 201) {
                        return response.data;
                    }
                    else {
                        return {error: response};
                    }
                });
            }
        };
    }).factory('DistributionPlanParameters', function () {
        var distributionPlanParameters = {};
        return{
            saveVariable: function (key, value) {
                distributionPlanParameters[key] = value;
            },
            retrieveVariable: function (key) {
                return distributionPlanParameters[key];
            }
        };
    })
;

