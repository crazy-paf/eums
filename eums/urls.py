from django.conf.urls import patterns, include, url
from django.contrib import admin

from eums.api.consignee.consignee import consigneeRouter
from eums.api.distribution_plan.distribution_plan import distributionPlanRouter
from eums.api.distribution_plan_line_item.distribution_plan_line_item import distributionPlanLineItemRouter
from eums.api.distribution_plan_node.distribution_plan_node_endpoint import distributionPlanNodeRouter
from eums.api.item.item_endpoint import itemRouter
from eums.api.item_unit.item_unit_endpoint import itemUnitRouter
from eums.api.programme.programme_endpoint import programmeRouter
from eums.api.sales_order.sales_order_endpoint import salesOrderRouter
from eums.api.sales_order_item.sales_order_item_endpoint import salesOrderItemRouter
from eums.api.user.user_endpoint import userRouter


urlpatterns = patterns(
    '',
    url(r'^$', 'eums.views.home', name='home'),
    url(r'^api/hook', 'eums.api.rapid_pro_hooks.hook.hook', name='hook'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(distributionPlanRouter.urls)),
    url(r'^api/', include(distributionPlanNodeRouter.urls)),
    url(r'^api/', include(distributionPlanLineItemRouter.urls)),
    url(r'^api/', include(itemUnitRouter.urls)),
    url(r'^api/', include(itemRouter.urls)),
    url(r'^api/', include(programmeRouter.urls)),
    url(r'^api/', include(consigneeRouter.urls)),
    url(r'^api/', include(salesOrderRouter.urls)),
    url(r'^api/', include(salesOrderItemRouter.urls)),
    url(r'^api/', include(userRouter.urls))
)